"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    city: "Bangalore",
    date_time: "",
    capacity: "",
    slug: "",
    waitlist_mode: "auto",
  });

  function set(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title") {
        updated.slug = value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }
      return updated;
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto uppercase font-inter relative z-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-seasons font-black tracking-tighter text-light drop-shadow-md">NEW EVENT</h1>
        <p className="text-[10px] mt-3 uppercase tracking-[0.2em] font-bold text-accent">Setup a new IRL experience</p>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col gap-6 relative z-10">
          {[
            { key: "title", label: "TITLE", type: "text", placeholder: "UNO SUNDAY — SCENE 01" },
            { key: "slug", label: "URL SLUG", type: "text", placeholder: "uno-sunday-scene-01" },
            { key: "location", label: "LOCATION", type: "text", placeholder: "CUBBON PARK" },
            { key: "city", label: "CITY", type: "text", placeholder: "BANGALORE" },
            { key: "date_time", label: "DATE & TIME", type: "datetime-local", placeholder: "" },
            { key: "capacity", label: "CAPACITY", type: "number", placeholder: "12" },
            { key: "description", label: "DESCRIPTION", type: "text", placeholder: "OPTIONAL" },
          ].map((f) => (
            <div key={f.key} className="group">
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="glass-input rounded-2xl text-sm"
              />
            </div>
          ))}

          <div className="group mt-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">
              WHEN FULL
            </label>
            <div className="relative">
              <select
                value={form.waitlist_mode}
                onChange={(e) => set("waitlist_mode", e.target.value)}
                className="glass-input rounded-2xl text-sm appearance-none cursor-pointer pr-10"
              >
                <option value="auto" className="bg-[#1a1a1a] text-light">AUTO WAITLIST</option>
                <option value="closed" className="bg-[#1a1a1a] text-light">CLOSE BOOKINGS</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-light/50 text-[10px] tracking-widest font-seasons rotate-90 w-4 h-4 text-center">
                &gt;
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-bold tracking-widest mt-2 pl-2 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex flex-col md:flex-row gap-4 pt-8 mt-6 border-t border-white/10">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-white/5 border border-white/10 text-light tracking-[0.2em] font-bold rounded-2xl py-4 flex items-center justify-center text-xs hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm"
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-accent border border-accent text-dark tracking-[0.2em] shadow-[0_0_20px_rgba(198,255,0,0.15)] font-bold rounded-2xl py-4 flex items-center justify-center text-xs hover:shadow-[0_0_30px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "CREATING..." : "CREATE EVENT →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
