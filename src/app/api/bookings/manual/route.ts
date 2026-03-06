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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_id, name, email, instagram, city } = body;

    if (!event_id || !name || !email) {
      return NextResponse.json(
        { error: "event, name and email are required" },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: event_id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!event)
      return NextResponse.json({ error: "event not found" }, { status: 404 });

    // Admin can always add — bypass capacity check
    const attendee = await prisma.attendee.upsert({
      where: { email },
      update: { name, instagram: instagram || null, city: city || null },
      create: { name, email, instagram: instagram || null, city: city || null },
    });

    const existing = await prisma.booking.findFirst({
      where: { event_id, attendee_id: attendee.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "already booked for this event" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.create({
      data: { event_id, attendee_id: attendee.id, status: "confirmed" },
    });

    // Send confirmation email
    try {
      const dateStr = new Date(event.date_time).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${booking.qr_token}`;

      await transporter.sendMail({
        from: `"thesocialplug." <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `you're in — ${event.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111;">
            <p style="font-size:18px;font-weight:700;margin:0 0 4px;">thesocialplug.</p>
            <p style="font-size:12px;color:#999;margin:0 0 32px;">irl > scrolling</p>
            <p style="font-size:22px;font-weight:700;margin:0 0 8px;">you're in.</p>
            <p style="font-size:14px;color:#666;margin:0 0 24px;">no more soon. see you there.</p>
            <div style="border:1px solid #eee;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="font-size:11px;color:#999;letter-spacing:1px;margin:0 0 12px;">EVENT</p>
              <p style="font-size:15px;font-weight:600;margin:0 0 8px;">${event.title}</p>
              <p style="font-size:13px;color:#666;margin:0 0 4px;">📍 ${event.location}, ${event.city}</p>
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
      console.error("email failed:", emailErr);
    }

    return NextResponse.json({ booking, status: "confirmed" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
