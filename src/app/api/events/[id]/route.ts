import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: {
          include: { attendee: true },
          orderBy: { booked_at: "asc" },
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!event)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Get current event before update
    const current = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: { in: ["confirmed", "checked_in"] } },
            },
          },
        },
      },
    });

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...body,
        ...(body.date_time && { date_time: new Date(body.date_time) }),
        ...(body.capacity && { capacity: parseInt(body.capacity) }),
      },
    });

    // If capacity increased, promote waitlisted people to fill new spots
    if (body.capacity && current) {
      const newCapacity = parseInt(body.capacity);
      const confirmedCount = current._count.bookings;
      const newSpots = newCapacity - confirmedCount;

      if (newSpots > 0) {
        // Get waitlisted bookings ordered by position
        const waitlisted = await prisma.booking.findMany({
          where: { event_id: id, status: "waitlist" },
          orderBy: { waitlist_position: "asc" },
          take: newSpots,
          include: { attendee: true },
        });

        // Promote each one
        for (const booking of waitlisted) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "confirmed", waitlist_position: null },
          });

          // Send promotion email
          try {
            const dateStr = new Date(event.date_time).toLocaleDateString(
              "en-IN",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${booking.qr_token}`;

            await transporter.sendMail({
              from: `"thesocialplug." <${process.env.GMAIL_USER}>`,
              to: booking.attendee.email,
              subject: `you're in — ${event.title}`,
              html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111;">
                  <p style="font-size:18px;font-weight:700;margin:0 0 4px;">thesocialplug.</p>
                  <p style="font-size:12px;color:#999;margin:0 0 32px;">irl > scrolling</p>
                  <p style="font-size:22px;font-weight:700;margin:0 0 8px;">a spot opened up. you're in.</p>
                  <p style="font-size:14px;color:#666;margin:0 0 24px;">the event capacity was increased and you've been confirmed.</p>
                  <div style="border:1px solid #eee;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <p style="font-size:11px;color:#999;letter-spacing:1px;margin:0 0 12px;">EVENT</p>
                    <p style="font-size:15px;font-weight:600;margin:0 0 8px;">${event.title}</p>
                    <p style="font-size:13px;color:#666;margin:0 0 4px;">📍 ${event.location}</p>
                    <p style="font-size:13px;color:#666;margin:0;">📅 ${dateStr}</p>
                  </div>
                  <div style="border:1px solid #eee;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                    <p style="font-size:11px;color:#999;letter-spacing:1px;margin:0 0 16px;">YOUR CHECK-IN QR</p>
                    <img src="${qrImageUrl}" width="160" height="160" alt="check-in qr"
                      style="display:block;margin:0 auto;border-radius:8px;" />
                    <p style="font-size:11px;color:#bbb;margin:12px 0 0;">screenshot this for event day</p>
                  </div>
                  <p style="font-size:12px;color:#999;">thesocialplug. · bangalore · irl > scrolling</p>
                </div>
              `,
            });
          } catch (emailErr) {
            console.error("promotion email failed:", emailErr);
          }
        }
      }
    }

    return NextResponse.json(event);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
