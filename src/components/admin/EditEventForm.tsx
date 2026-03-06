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
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs text-gray-400 block mb-1">
              {f.label}
            </label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        ))}

        <div>
          <label className="text-xs text-gray-400 block mb-1">when full</label>
          <select
            value={form.waitlist_mode}
            onChange={(e) => set("waitlist_mode", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white"
          >
            <option value="auto">auto waitlist</option>
            <option value="closed">close bookings</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "saving..." : "save changes"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">danger zone</p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full border border-red-200 text-red-400 rounded-lg py-2.5 text-sm hover:bg-red-50 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {deleting ? "deleting..." : "delete event"}
          </button>
        </div>
      </div>
    </div>
  );
}
