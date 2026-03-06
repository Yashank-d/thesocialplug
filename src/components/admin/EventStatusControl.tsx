"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["draft", "active", "completed"] as const;

export default function EventStatusControl({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => updateStatus(s)}
          disabled={loading}
          className={`text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-2 rounded-full outline-none transition-all border ${
            status === s
              ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(198,255,0,0.1)] backdrop-blur-md"
              : "bg-white/5 text-light/50 border-white/10 hover:border-white/20 hover:text-light hover:-translate-y-0.5"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
