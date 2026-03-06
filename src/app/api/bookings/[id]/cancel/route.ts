import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PUT(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { event: true, attendee: true },
    });
    if (!booking)
      return NextResponse.json({ error: "not found" }, { status: 404 });

    // Cancel the booking
    await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });

    // If confirmed, promote first waitlist person
    if (booking.status === "confirmed") {
      const nextInLine = await prisma.booking.findFirst({
        where: { event_id: booking.event_id, status: "waitlist" },
        orderBy: { waitlist_position: "asc" },
        include: { attendee: true, event: true },
      });

      if (nextInLine) {
        await prisma.booking.update({
          where: { id: nextInLine.id },
          data: { status: "confirmed", waitlist_position: null },
        });

        // Email the promoted person
        try {
          const dateStr = new Date(
            nextInLine.event.date_time,
          ).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${nextInLine.qr_token}`;

          await resend.emails.send({
            from: "thesocialplug. <onboarding@resend.dev>",
            to: nextInLine.attendee.email,
            subject: `you're in — ${nextInLine.event.title}`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111;">
                <p style="font-size:18px;font-weight:700;margin:0 0 4px;">thesocialplug.</p>
                <p style="font-size:12px;color:#999;margin:0 0 32px;">irl > scrolling</p>
                <p style="font-size:22px;font-weight:700;margin:0 0 8px;">a spot opened up. you're in.</p>
                <p style="font-size:14px;color:#666;margin:0 0 24px;">
                  someone cancelled and you were first on the waitlist. see you there.
                </p>
                <div style="border:1px solid #eee;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <p style="font-size:11px;color:#999;letter-spacing:1px;margin:0 0 12px;">EVENT</p>
                  <p style="font-size:15px;font-weight:600;margin:0 0 8px;">${nextInLine.event.title}</p>
                  <p style="font-size:13px;color:#666;margin:0 0 4px;">📍 ${nextInLine.event.location}</p>
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
          console.error("waitlist email failed:", emailErr);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
