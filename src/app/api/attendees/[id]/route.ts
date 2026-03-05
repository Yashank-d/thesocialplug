import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const attendee = await prisma.attendee.findUnique({
      where: { id },
      include: {
        bookings: {
          include: { event: true },
          orderBy: { booked_at: "desc" },
        },
      },
    });
    if (!attendee)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(attendee);
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
    const attendee = await prisma.attendee.update({
      where: { id },
      data: {
        name: body.name,
        instagram: body.instagram || null,
        city: body.city || null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(attendee);
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
    await prisma.attendee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
