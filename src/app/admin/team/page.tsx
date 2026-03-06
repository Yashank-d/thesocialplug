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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">team</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-400 mb-4">
          team members can access check-in mode. admins have full access.
        </p>
        <AddTeamMember />
      </div>

      {team.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">no team members yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium">{member.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{member.email}</div>
              <div className="text-xs text-gray-300 mt-0.5">
                invite sent · can log in once accepted
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  member.role === "admin"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {member.role}
              </span>
              <RemoveTeamMember memberId={member.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
