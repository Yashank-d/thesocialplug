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
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">NAME</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="FULL NAME"
            className="glass-input rounded-2xl text-sm"
          />
        </div>
        <div className="group">
          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">EMAIL</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="EMAIL ADDRESS"
            className="glass-input rounded-2xl text-sm"
          />
        </div>
      </div>

      <div className="group">
        <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors">ROLE</label>
        <div className="relative">
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className="glass-input rounded-2xl text-sm appearance-none cursor-pointer"
          >
            <option value="team" className="bg-dark text-light">TEAM</option>
            <option value="admin" className="bg-dark text-light">ADMIN</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-light/50">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 font-bold tracking-widest text-xs uppercase pl-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
      {sent && (
        <p className="text-accent font-bold tracking-widest text-xs uppercase bg-accent/10 p-3 rounded-xl border border-accent/20 inline-block text-center shadow-[0_0_10px_rgba(198,255,0,0.1)]">INVITE SENT SUCCESSFULLY.</p>
      )}

      <button
        onClick={handleAdd}
        disabled={loading}
        className="text-[10px] uppercase font-bold tracking-[0.2em] bg-accent border border-accent text-dark rounded-2xl outline-none py-4 hover:shadow-[0_0_20px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 w-full mt-2"
      >
        {loading ? "SENDING INVITE..." : "ADD + SEND INVITE"}
      </button>
    </div>
  );
}
