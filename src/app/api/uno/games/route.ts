import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const game = await prisma.unoGame.findFirst({
      where: { event_id: eventId },
      include: {
        scores: {
          orderBy: { created_at: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(game || null);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json(
        { error: "event_id is required" },
        { status: 400 },
      );
    }

    // Check if there's already an active game for this event
    const existingGame = await prisma.unoGame.findFirst({
      where: { event_id, status: "in_progress" },
    });

    if (existingGame) {
      return NextResponse.json(existingGame);
    }

    // Create a new game
    const game = await prisma.unoGame.create({
      data: {
        event_id,
        status: "in_progress",
      },
    });

    return NextResponse.json(game);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    // Delete all games associated with this event (effectively resetting)
    // Because of Cascade delete in prisma, this also drops the associated UnoScores
    await prisma.unoGame.deleteMany({
      where: { event_id: eventId },
    });

    // Also clear the winner from the Event so the badge disappears and new games can be played
    await prisma.event.update({
      where: { id: eventId },
      data: { uno_winner_name: null },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
