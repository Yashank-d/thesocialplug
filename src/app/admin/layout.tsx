import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { prisma } from "@/lib/prisma";
import PageTransition from "@/components/providers/PageTransition";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  params: unknown;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get role
  const member = await prisma.teamMember.findUnique({
    where: { email: user.email! },
  });
  const role = member?.role ?? "admin";

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-light font-inter uppercase overflow-hidden">
      {/* Admin Background Orbs */}
      <div className="orb-container">
        <div className="orb orb-blue w-[700px] h-[700px] top-[-20%] right-[-10%] opacity-20"></div>
        <div className="orb orb-accent w-[400px] h-[400px] bottom-[-10%] left-[-10%] opacity-15" style={{ animationDelay: '-12s' }}></div>
      </div>

      <AdminNav role={role} />
      <PageTransition>
        <main className="max-w-4xl mx-auto px-4 py-8 pt-32 relative z-10">{children}</main>
      </PageTransition>
    </div>
  );
}
