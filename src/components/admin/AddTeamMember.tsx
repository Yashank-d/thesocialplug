"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTeamMember() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role: "team" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name || !form.email) {
      setError("name and email required");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/team", {
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

    setSent(true);
    setForm({ name: "", email: "", role: "team" });
    setLoading(false);
    setTimeout(() => {
      setSent(false);
      router.refresh();
    }, 3000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="full name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">role</label>
        <select
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
        >
          <option value="team">team</option>
          <option value="admin">admin</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
      {sent && (
        <p className="text-green-500 text-xs">invite sent successfully.</p>
      )}

      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-black text-white rounded-lg py-2 text-xs font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "sending invite..." : "add + send invite"}
      </button>
    </div>
  );
}
