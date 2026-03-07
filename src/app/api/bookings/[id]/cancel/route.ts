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

    // Email the cancelled attendee
    try {
      const dateStr = new Date(booking.event.date_time).toLocaleDateString(
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

      await transporter.sendMail({
        from: `"thesocialplug." <${process.env.GMAIL_USER}>`,
        to: booking.attendee.email,
        subject: `booking cancelled — ${booking.event.title}`,
        html: `
          <div style="font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width:480px; margin:0 auto; padding:32px; color:#F5F5F5; background-color:#0D0D0D; border-radius:16px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
              <tr>
                <td>
                  <p style="font-size:18px; font-weight:900; margin:0; letter-spacing:-0.5px; color:#c6ff00;">the<br/>socialplug.</p>
                </td>
                <td align="right">
                  <p style="font-size:10px; color:#ffffff80; margin:0; letter-spacing:2px; font-weight:700; text-transform:uppercase;">irl &gt; scrolling</p>
                </td>
              </tr>
            </table>

            <p style="font-size:24px; font-weight:800; margin:0 0 8px; text-transform:uppercase; letter-spacing:-1px;">
              YOUR BOOKING WAS CANCELLED.
            </p>
            <p style="font-size:14px; color:#ffffffb3; margin:0 0 32px; line-height:1.5;">
              Hey ${booking.attendee.name}, your spot for the event below has been cancelled by the organiser.
            </p>

            <div style="background-color:#ffffff0a; border:1px solid #ffffff1a; border-radius:16px; padding:24px; margin-bottom:24px;">
              <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 12px; font-weight:700;">EVENT DETAILS</p>
              <p style="font-size:18px; font-weight:800; margin:0 0 16px; text-transform:uppercase; letter-spacing:-0.5px; color:#c6ff00;">${booking.event.title}</p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom:12px; border-bottom:1px solid #ffffff1a;">
                    <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 4px; font-weight:700; text-transform:uppercase;">Location</p>
                    <p style="font-size:14px; color:#F5F5F5; margin:0;">${booking.event.location}, ${booking.event.city}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 4px; font-weight:700; text-transform:uppercase;">Date & Time</p>
                    <p style="font-size:14px; color:#F5F5F5; margin:0;">${dateStr}</p>
                  </td>
                </tr>
              </table>
            </div>

            <p style="font-size:13px; color:#ffffffb3; margin:0 0 24px;">
              If you think this was a mistake, reach out to us on instagram.
            </p>

            <p style="font-size:10px; color:#ffffff4d; margin:0; text-align:center; letter-spacing:1px;">
              THESOCIALPLUG. · BANGALORE
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("cancellation email failed:", emailErr);
    }

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

          await transporter.sendMail({
            from: `"thesocialplug." <${process.env.GMAIL_USER}>`,
            to: nextInLine.attendee.email,
            subject: `you're in — ${nextInLine.event.title}`,
            html: `
              <div style="font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width:480px; margin:0 auto; padding:32px; color:#F5F5F5; background-color:#0D0D0D; border-radius:16px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                  <tr>
                    <td>
                      <p style="font-size:18px; font-weight:900; margin:0; letter-spacing:-0.5px; color:#c6ff00;">the<br/>socialplug.</p>
                    </td>
                    <td align="right">
                      <p style="font-size:10px; color:#ffffff80; margin:0; letter-spacing:2px; font-weight:700; text-transform:uppercase;">irl &gt; scrolling</p>
                    </td>
                  </tr>
                </table>

                <p style="font-size:24px; font-weight:800; margin:0 0 8px; text-transform:uppercase; letter-spacing:-1px;">
                  A SPOT OPENED UP. YOU'RE IN.
                </p>
                <p style="font-size:14px; color:#ffffffb3; margin:0 0 32px; line-height:1.5;">
                  Someone cancelled and you were first on the waitlist. See you there.
                </p>

                <div style="background-color:#ffffff0a; border:1px solid #ffffff1a; border-radius:16px; padding:24px; margin-bottom:24px;">
                  <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 12px; font-weight:700;">EVENT DETAILS</p>
                  <p style="font-size:18px; font-weight:800; margin:0 0 16px; text-transform:uppercase; letter-spacing:-0.5px; color:#c6ff00;">${nextInLine.event.title}</p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding-bottom:12px; border-bottom:1px solid #ffffff1a;">
                        <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 4px; font-weight:700; text-transform:uppercase;">Location</p>
                        <p style="font-size:14px; color:#F5F5F5; margin:0;">${nextInLine.event.location}, ${nextInLine.event.city}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:12px;">
                        <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 4px; font-weight:700; text-transform:uppercase;">Date & Time</p>
                        <p style="font-size:14px; color:#F5F5F5; margin:0;">${dateStr}</p>
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="background-color:#ffffff0a; border:1px solid #ffffff1a; border-radius:16px; padding:32px; margin-bottom:32px; text-align:center;">
                  <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 20px; font-weight:700;">YOUR CHECK-IN QR</p>
                  <div style="background-color:#0D0D0D; padding:16px; border-radius:16px; display:inline-block; border:1px solid #ffffff1a;">
                    <img src="${qrImageUrl}&color=c6ff00&bgcolor=0d0d0d" width="160" height="160" alt="check-in qr code" style="display:block; margin:0 auto;" />
                  </div>
                  <p style="font-size:10px; color:#ffffff80; margin:20px 0 0; letter-spacing:2px; font-weight:700;">SHOW THIS AT THE DOOR</p>
                </div>

                <p style="font-size:10px; color:#ffffff4d; margin:0; text-align:center; letter-spacing:1px;">
                  THESOCIALPLUG. · BANGALORE
                </p>
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
