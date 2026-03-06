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
      className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-light/40 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-all uppercase cursor-pointer disabled:opacity-50"
    >
      {loading ? "..." : "REMOVE"}
    </button>
  );
}
