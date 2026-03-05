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
    <div className="flex gap-1">
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => updateStatus(s)}
          disabled={loading}
          className={`text-xs px-3 py-1 rounded-lg cursor-pointer transition-all ${
            status === s
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
