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
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold">new event</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex flex-col gap-4">
          {[
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
            {
              key: "city",
              label: "city",
              type: "text",
              placeholder: "Bangalore",
            },
            {
              key: "date_time",
              label: "date & time",
              type: "datetime-local",
              placeholder: "",
            },
            {
              key: "capacity",
              label: "capacity",
              type: "number",
              placeholder: "12",
            },
            {
              key: "description",
              label: "description",
              type: "text",
              placeholder: "optional",
            },
          ].map((f) => (
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
            <label className="text-xs text-gray-400 block mb-1">
              when full
            </label>
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
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "creating..." : "create event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
