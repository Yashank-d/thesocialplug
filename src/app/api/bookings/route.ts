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

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { booked_at: "desc" },
      include: { attendee: true, event: true },
    });
    return NextResponse.json(bookings);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_id, name, email, instagram, city } = body;

    if (!event_id || !name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 },
      );
    }

    // Get event with active booking count (ignore cancelled)
    const event = await prisma.event.findUnique({
      where: { id: event_id },
      include: { 
        _count: { 
          select: { 
            bookings: {
              where: {
                status: {
                  in: ["confirmed", "waitlist"]
                }
              }
            } 
          } 
        } 
      },
    });

    if (!event)
      return NextResponse.json({ error: "event not found" }, { status: 404 });
    if (event.status !== "active")
      return NextResponse.json(
        { error: "event is not open for bookings" },
        { status: 400 },
      );

    // Determine status
    const isFull = event._count.bookings >= event.capacity;
    if (isFull && event.waitlist_mode === "closed") {
      return NextResponse.json({ error: "event is full" }, { status: 400 });
    }

    const status = isFull ? "waitlist" : "confirmed";

    // Waitlist position
    let waitlist_position = null;
    if (status === "waitlist") {
      const waitlistCount = await prisma.booking.count({
        where: { event_id, status: "waitlist" },
      });
      waitlist_position = waitlistCount + 1;
    }

    // Upsert attendee
    const attendee = await prisma.attendee.upsert({
      where: { email },
      update: {
        name,
        instagram: instagram || null,
        city: city || null,
      },
      create: {
        name,
        email,
        instagram: instagram || null,
        city: city || null,
      },
    });

    // Check duplicate or cancelled booking
    const existing = await prisma.booking.findFirst({
      where: { event_id, attendee_id: attendee.id },
    });
    
    if (existing) {
      if (existing.status === "cancelled") {
        return NextResponse.json(
          { error: "uh oh, looks like your spot was cancelled! ✨ hit us up on ig to fix this." },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { error: "you have already booked this event" },
        { status: 400 },
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        event_id,
        attendee_id: attendee.id,
        status,
        waitlist_position,
      },
    });
    
    // Send confirmation email
    try {
      const subject =
        status === "waitlist"
          ? `you're on the waitlist — ${event.title}`
          : `you're in — ${event.title}`;

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
        subject,
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
          ${status === "waitlist" ? "WAITLISTED." : "CONFIRMED."}
        </p>
        <p style="font-size:14px; color:#ffffffb3; margin:0 0 32px; line-height:1.5;">
          ${
            status === "waitlist"
              ? `You're #${waitlist_position} on the waitlist. We'll email you if a spot opens up.`
              : "Check out the details below. See you there."
          }
        </p>

        <div style="background-color:#ffffff0a; border:1px solid #ffffff1a; border-radius:16px; padding:24px; margin-bottom:24px;">
          <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 12px; font-weight:700;">EVENT DETAILS</p>
          <p style="font-size:18px; font-weight:800; margin:0 0 16px; text-transform:uppercase; letter-spacing:-0.5px; color:#c6ff00;">${event.title}</p>
          
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom:12px; border-bottom:1px solid #ffffff1a;">
                <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 4px; font-weight:700; text-transform:uppercase;">Location</p>
                <p style="font-size:14px; color:#F5F5F5; margin:0;">${event.location}, ${event.city}</p>
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

        ${
          status === "confirmed"
            ? `
        <div style="background-color:#ffffff0a; border:1px solid #ffffff1a; border-radius:16px; padding:32px; margin-bottom:32px; text-align:center;">
          <p style="font-size:10px; color:#ffffff80; letter-spacing:2px; margin:0 0 20px; font-weight:700;">YOUR CHECK-IN QR</p>
          <div style="background-color:#0D0D0D; padding:16px; border-radius:16px; display:inline-block; border:1px solid #ffffff1a;">
            <img src="${qrImageUrl}&color=c6ff00&bgcolor=0d0d0d" width="160" height="160" alt="check-in qr code" style="display:block; margin:0 auto;" />
          </div>
          <p style="font-size:10px; color:#ffffff80; margin:20px 0 0; letter-spacing:2px; font-weight:700;">SHOW THIS AT THE DOOR</p>
        </div>
        `
            : ""
        }

        <p style="font-size:10px; color:#ffffff4d; margin:0; text-align:center; letter-spacing:1px;">
          THESOCIALPLUG. · BANGALORE
        </p>
      </div>
    `,
      });
    } catch (emailErr) {
      console.error("email failed:", emailErr);
      return NextResponse.json({
        booking,
        status,
        waitlist_position,
        emailError:
          emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
    }

    return NextResponse.json({ booking, status, waitlist_position });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
