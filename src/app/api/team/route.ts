import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client — needed for inviteUserByEmail
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

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

    // Add to TeamMember table
    const member = await prisma.teamMember.create({
      data: { name, email, role: role || "team" },
    });

    // Send Supabase invite email
    const { error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`,
        data: { name, role },
      });

    console.log(
      "invite result:",
      inviteError ? inviteError.message : "sent ok",
    );

    if (inviteError) {
      console.error("invite error:", inviteError);
      // Don't fail — member is added, invite just didn't send
    }

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
