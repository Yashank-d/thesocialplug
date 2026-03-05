import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const attendees = await prisma.attendee.findMany({
      orderBy: { created_at: "desc" },
      include: {
        bookings: { include: { event: true } },
      },
    });

    const rows = [
      ["Name", "Email", "Instagram", "City", "Events", "Joined"],
      ...attendees.map((a) => [
        a.name,
        a.email,
        a.instagram || "",
        a.city || "",
        a.bookings.map((b) => b.event.title).join(" | "),
        new Date(a.created_at).toLocaleDateString("en-IN"),
      ]),
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="attendees.csv"',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
