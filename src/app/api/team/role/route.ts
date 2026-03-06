import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ role: "admin" });
    }

    const member = await prisma.teamMember.findUnique({
      where: { email },
    });

    // If not in TeamMember table, treat as admin (that's you)
    return NextResponse.json({ role: member?.role || "admin" });
  } catch {
    return NextResponse.json({ role: "admin" });
  }
}
