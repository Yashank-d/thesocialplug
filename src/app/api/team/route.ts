import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: { created_at: "asc" },
    });
    return NextResponse.json(team);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email required" },
        { status: 400 },
      );
    }

    const member = await prisma.teamMember.create({
      data: { name, email, role: role || "team" },
    });
    return NextResponse.json(member);
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "email already exists" },
        { status: 400 },
      );
    }
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
