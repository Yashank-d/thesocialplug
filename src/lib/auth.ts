import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.teamMember.findUnique({
    where: { email: user.email! },
  });

  // If in TeamMember table with team role — block
  if (member?.role === "team") {
    redirect("/admin/events");
  }

  return user;
}

export async function getRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "team";

  const member = await prisma.teamMember.findUnique({
    where: { email: user.email! },
  });

  return member?.role ?? "admin";
}
