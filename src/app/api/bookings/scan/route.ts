import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { qr_token, event_id } = await req.json();

    if (!qr_token) {
      return NextResponse.json({ error: "no qr token" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { qr_token },
      include: { attendee: true, event: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "invalid qr code" }, { status: 404 });
    }

    if (booking.event_id !== event_id) {
      return NextResponse.json(
        { error: "qr is for a different event" },
        { status: 400 },
      );
    }

    if (booking.status === "checked_in") {
      return NextResponse.json({
        already: true,
        attendee: booking.attendee,
        booking,
      });
    }

    if (booking.status === "waitlist") {
      return NextResponse.json(
        { error: "attendee is on waitlist, not confirmed" },
        { status: 400 },
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "booking was cancelled" },
        { status: 400 },
      );
    }

    // Check in
    const updated = await prisma.booking.update({
      where: { qr_token },
      data: { status: "checked_in", checked_in_at: new Date() },
      include: { attendee: true },
    });

    return NextResponse.json({
      success: true,
      attendee: updated.attendee,
      booking: updated,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
