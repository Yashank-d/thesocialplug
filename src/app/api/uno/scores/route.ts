import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { game_id, player_name } = body;

    if (!game_id || !player_name) {
      return NextResponse.json(
        { error: "game_id and player_name are required" },
        { status: 400 },
      );
    }

    // Check if player already exists in this game
    const existingScore = await prisma.unoScore.findFirst({
      where: { game_id, player_name },
    });

    if (existingScore) {
      return NextResponse.json(
        { error: "Player already exists in this game" },
        { status: 400 },
      );
    }

    const score = await prisma.unoScore.create({
      data: {
        game_id,
        player_name,
        score: 0,
      },
    });

    return NextResponse.json(score);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { score_id, additional_score } = body;

    if (!score_id || typeof additional_score !== "number") {
      return NextResponse.json(
        { error: "score_id and additional_score are required" },
        { status: 400 },
      );
    }

    const currentScore = await prisma.unoScore.findUnique({
      where: { id: score_id },
      include: {
        game: {
          include: {
            event: { select: { uno_version: true } }
          }
        }
      }
    });

    if (!currentScore) {
      return NextResponse.json({ error: "Score record not found" }, { status: 404 });
    }

    const unoVersion = currentScore.game?.event?.uno_version || "classic";
    const winThreshold = unoVersion === "no_mercy" ? 1000 : 500;

    const updatedScore = await prisma.unoScore.update({
      where: { id: score_id },
      data: {
        score: currentScore.score + additional_score,
      },
    });

    // Check for endgame condition
    if (updatedScore.score >= winThreshold) {
      // The player who hits 500 points is the winner
      const winnerName = updatedScore.player_name;

      // We need the event_id from the game to update the Event model
      const game = await prisma.unoGame.findUnique({
        where: { id: updatedScore.game_id },
        select: { event_id: true }
      });

      if (game) {
        // Update the Event with the winner's name
        await prisma.event.update({
          where: { id: game.event_id },
          data: { uno_winner_name: winnerName }
        });

        // Delete the game to save database space (Cascades to all UnoScores)
        await prisma.unoGame.delete({
          where: { id: updatedScore.game_id }
        });
      }

      // Return the winner data back to the client so it can handle the UI
      return NextResponse.json({ ...updatedScore, gameOver: true, winner: winnerName });
    }

    return NextResponse.json(updatedScore);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scoreId = searchParams.get("id");

    if (!scoreId) {
      return NextResponse.json({ error: "Score ID is required" }, { status: 400 });
    }

    await prisma.unoScore.delete({
      where: { id: scoreId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
