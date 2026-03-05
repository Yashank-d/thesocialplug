import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const attendees = await prisma.attendee.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { instagram: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { created_at: "desc" },
      include: { _count: { select: { bookings: true } } },
    });
    return NextResponse.json(attendees);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, instagram, city, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 },
      );
    }

    const attendee = await prisma.attendee.upsert({
      where: { email },
      update: {
        name,
        instagram: instagram || null,
        city: city || null,
        notes: notes || null,
      },
      create: {
        name,
        email,
        instagram: instagram || null,
        city: city || null,
        notes: notes || null,
      },
    });
    return NextResponse.json(attendee);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
