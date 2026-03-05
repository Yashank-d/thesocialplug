import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date_time: "asc" },
      include: { _count: { select: { bookings: true } } },
    });
    return NextResponse.json(events);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      location,
      city,
      date_time,
      capacity,
      slug,
      waitlist_mode,
    } = body;

    if (!title || !location || !date_time || !capacity || !slug) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 },
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        location,
        city: city || "Bangalore",
        date_time: new Date(date_time),
        capacity: parseInt(capacity),
        slug,
        waitlist_mode: waitlist_mode || "auto",
      },
    });
    return NextResponse.json(event);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "slug already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
