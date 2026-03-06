"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManualBooking({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    instagram: "",
    city: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email) {
      setError("name and email required");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, event_id: eventId }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setForm({ name: "", email: "", instagram: "", city: "" });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        + add manually
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {[
        { key: "name", label: "name", placeholder: "full name", type: "text" },
        {
          key: "email",
          label: "email",
          placeholder: "email address",
          type: "email",
        },
        {
          key: "instagram",
          label: "instagram (optional)",
          placeholder: "@handle",
          type: "text",
        },
        {
          key: "city",
          label: "city (optional)",
          placeholder: "bangalore",
          type: "text",
        },
      ].map((f) => (
        <div key={f.key}>
          <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
          <input
            type={f.type}
            value={form[f.key as keyof typeof form]}
            onChange={(e) => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>
      ))}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="flex-1 border border-gray-200 rounded-lg py-2 text-xs text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-black text-white rounded-lg py-2 text-xs font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "adding..." : "add + send email"}
        </button>
      </div>
    </div>
  );
}
