"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveTeamMember({ memberId }: { memberId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    if (!confirm("remove this team member?")) return;
    setLoading(true);
    await fetch(`/api/team/${memberId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-xs text-gray-300 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
    >
      {loading ? "..." : "remove"}
    </button>
  );
}
