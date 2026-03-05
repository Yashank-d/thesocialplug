import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "checked_in", checked_in_at: new Date() },
    });
    return NextResponse.json(booking);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
