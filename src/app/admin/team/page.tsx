import { prisma } from "@/lib/prisma";
import AddTeamMember from "@/components/admin/AddTeamMember";
import RemoveTeamMember from "@/components/admin/RemoveTeamMember";
import { requireAdmin } from "@/lib/auth";

export default async function TeamPage() {
  await requireAdmin();
  const team = await prisma.teamMember.findMany({
    orderBy: { created_at: "asc" },
  });

  return (
    <div className="uppercase font-inter relative z-10 w-full max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6 relative z-10">
        <h1 className="text-4xl md:text-5xl font-seasons font-black tracking-tighter text-light drop-shadow-md">TEAM</h1>
      </div>

      <div className="glass-panel rounded-3xl p-8 md:p-10 mb-12 relative z-10">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mb-8 pb-4 border-b border-white/10">
          TEAM MEMBERS CAN ACCESS CHECK-IN MODE. ADMINS HAVE FULL ACCESS.
        </p>
        <AddTeamMember />
      </div>

      {team.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center relative z-10">
          <p className="text-xs font-bold tracking-[0.2em] text-light/50 uppercase">NO TEAM MEMBERS YET.</p>
        </div>
      )}

      <div className="flex flex-col gap-5 relative z-10">
        {team.map((member) => (
          <div
            key={member.id}
            className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-white/[0.15] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <div className="text-2xl font-seasons font-black tracking-tighter uppercase mb-2 text-light drop-shadow-sm">{member.name}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mb-3">{member.email}</div>
              <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-accent bg-accent/10 border border-accent/20 inline-block px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(198,255,0,0.1)] backdrop-blur-md">
                INVITE SENT <span className="mx-1 text-accent/50">·</span> CAN LOG IN ONCE ACCEPTED
              </div>
            </div>
            <div className="flex items-center gap-6 mt-6 md:mt-0 shrink-0">
              <span
                className={`text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-2 rounded-full border ${
                  member.role === "admin"
                    ? "bg-white/10 text-light border-white/20 backdrop-blur-md"
                    : "bg-white/5 text-light/50 border-white/10"
                }`}
              >
                {member.role}
              </span>
              <div className="scale-90 origin-right">
                <RemoveTeamMember memberId={member.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
