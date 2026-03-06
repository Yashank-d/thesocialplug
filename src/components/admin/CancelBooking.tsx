"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBooking({
  bookingId,
  status,
  visible,
}: {
  bookingId: string;
  status: string;
  visible: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!visible || status === "cancelled" || status === "checked_in")
    return null;

  async function handleCancel() {
    if (!confirm("cancel this booking? waitlist will be auto-promoted."))
      return;
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/cancel`, { method: "PUT" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-gray-300 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
    >
      {loading ? "..." : "cancel"}
    </button>
  );
}
