import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...body,
        ...(body.date_time && { date_time: new Date(body.date_time) }),
        ...(body.capacity && { capacity: parseInt(body.capacity) }),
      },
    });
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
