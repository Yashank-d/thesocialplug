"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  city: string;
  date_time: Date;
  capacity: number;
  slug: string;
  waitlist_mode: string;
  activity_type: string;
  uno_version: string | null;
}

export default function EditEventForm({ event }: { event: Event }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Format date for datetime-local input
  const localDate = new Date(event.date_time);
  const pad = (n: number) => String(n).padStart(2, "0");
  const defaultDateTime = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;

  const [form, setForm] = useState({
    title: event.title,
    description: event.description || "",
    location: event.location,
    city: event.city,
    date_time: defaultDateTime,
    capacity: String(event.capacity),
    slug: event.slug,
    waitlist_mode: event.waitlist_mode,
    activity_type: event.activity_type || "other",
    uno_version: event.uno_version || "classic",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        capacity: parseInt(form.capacity),
        date_time: new Date(form.date_time).toISOString(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push(`/admin/events/${event.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("delete this event? this will remove all bookings too."))
      return;
    setDeleting(true);

    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  const fields = [
    {
      key: "title",
      label: "title",
      type: "text",
      placeholder: "UNO Sunday — Scene 01",
    },
    {
      key: "slug",
      label: "url slug",
      type: "text",
      placeholder: "uno-sunday-scene-01",
    },
    {
      key: "location",
      label: "location",
      type: "text",
      placeholder: "Cubbon Park",
    },
    { key: "city", label: "city", type: "text", placeholder: "Bangalore" },
    {
      key: "date_time",
      label: "date & time",
      type: "datetime-local",
      placeholder: "",
    },
    { key: "capacity", label: "capacity", type: "number", placeholder: "12" },
    {
      key: "description",
      label: "description",
      type: "text",
      placeholder: "optional",
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-8 md:p-10 relative z-10 font-inter uppercase">
      <div className="flex flex-col gap-6 w-full">
        {fields.map((f) => (
          <div key={f.key} className="group">
            <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">
              {f.label}
            </label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="glass-input rounded-2xl text-sm"
              style={f.type === "datetime-local" ? { colorScheme: "dark" } : {}}
            />
          </div>
        ))}

        <div className="group mt-2 border-t border-white/10 pt-6">
          <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">
            ACTIVITY TYPE
          </label>
          <div className="relative">
            <select
              value={form.activity_type}
              onChange={(e) => set("activity_type", e.target.value)}
              className="glass-input rounded-2xl text-sm appearance-none cursor-pointer pr-10"
            >
              <option value="other" className="bg-[#1a1a1a] text-light">STANDARD EVENT</option>
              <option value="uno" className="bg-[#1a1a1a] text-light">UNO GAME SHOWDOWN</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-light/50 text-[10px] tracking-widest font-seasons w-4 h-4 text-center">
              ▼
            </div>
          </div>
        </div>

        {form.activity_type === "uno" && (
          <div className="group mt-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">
              UNO RULES VERSION
            </label>
            <div className="relative">
              <select
                value={form.uno_version}
                onChange={(e) => set("uno_version", e.target.value)}
                className="glass-input rounded-2xl text-sm appearance-none cursor-pointer pr-10 border-accent/30 bg-accent/5 ring-1 ring-accent/20"
              >
                <option value="classic" className="bg-[#1a1a1a] text-light">CLASSIC (500 pts)</option>
                <option value="flip" className="bg-[#1a1a1a] text-light">UNO FLIP! (Light & Dark Sides)</option>
                <option value="no_mercy" className="bg-[#1a1a1a] text-light">SHOW 'EM NO MERCY (Brutal & Knockouts)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accent text-[10px] tracking-widest font-seasons w-4 h-4 text-center">
                ▼
              </div>
            </div>
          </div>
        )}

        <div className="group">
          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">WHEN FULL</label>
          <div className="relative">
            <select
              value={form.waitlist_mode}
              onChange={(e) => set("waitlist_mode", e.target.value)}
              className="glass-input rounded-2xl text-sm appearance-none cursor-pointer"
            >
              <option value="auto" className="bg-dark text-light">AUTO WAITLIST</option>
              <option value="closed" className="bg-dark text-light">CLOSE BOOKINGS</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-light/50">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 font-bold tracking-[0.2em] text-[10px] pl-2 bg-red-500/10 p-3 rounded-2xl border border-red-500/20">{error}</p>}

        <div className="flex flex-col md:flex-row gap-4 pt-4 mt-2 border-t border-white/10">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-white/5 border border-white/10 text-light font-bold tracking-[0.2em] uppercase rounded-2xl outline-none py-4 text-[10px] hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-accent border border-accent text-dark font-bold tracking-[0.2em] uppercase rounded-2xl outline-none py-4 text-[10px] hover:shadow-[0_0_20px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="pt-8 mt-4 border-t border-white/10">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-red-400 mb-4 pl-2">DANGER ZONE</p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-red-400/10 border border-red-400/20 text-red-400 font-bold tracking-[0.2em] uppercase rounded-2xl outline-none py-4 text-[10px] hover:bg-red-400/20 hover:border-red-400/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {deleting ? "DELETING..." : "DELETE EVENT"}
          </button>
        </div>
      </div>
    </div>
  );
}
