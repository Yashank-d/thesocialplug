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
        className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent bg-accent/10 border border-accent/20 px-5 py-2.5 hover:bg-accent hover:text-dark hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(198,255,0,0.3)] transition-all duration-300 rounded-full w-max"
      >
        + ADD MANUALLY
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      {[
        { key: "name", label: "NAME", placeholder: "FULL NAME", type: "text" },
        {
          key: "email",
          label: "EMAIL",
          placeholder: "EMAIL ADDRESS",
          type: "email",
        },
        {
          key: "instagram",
          label: "INSTAGRAM (OPTIONAL)",
          placeholder: "@HANDLE",
          type: "text",
        },
        {
          key: "city",
          label: "CITY (OPTIONAL)",
          placeholder: "BANGALORE",
          type: "text",
        },
      ].map((f) => (
        <div key={f.key} className="group">
          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">{f.label}</label>
          <input
            type={f.type}
            value={form[f.key as keyof typeof form]}
            onChange={(e) => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="glass-input rounded-2xl text-sm"
          />
        </div>
      ))}

      {error && <p className="text-red-400 font-bold tracking-widest text-xs pl-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4 pt-4 mt-2 border-t border-white/10">
        <button
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="flex-1 bg-white/5 border border-white/10 text-light font-bold tracking-[0.2em] uppercase rounded-2xl outline-none py-3.5 text-[10px] hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
        >
          CANCEL
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-accent border border-accent text-dark font-bold tracking-[0.2em] uppercase rounded-2xl outline-none py-3.5 text-[10px] hover:shadow-[0_0_20px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {loading ? "ADDING..." : "ADD + SEND EMAIL"}
        </button>
      </div>
    </div>
  );
}
