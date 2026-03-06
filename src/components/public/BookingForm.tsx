"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function BookingForm({
  eventId,
  isFull,
}: {
  eventId: string;
  isFull: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    instagram: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    status: string;
    qr_token: string;
    waitlist_position: number | null;
  } | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("name and email are required");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings", {
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

    setResult({
      status: data.status,
      qr_token: data.booking.qr_token,
      waitlist_position: data.waitlist_position,
    });
    setLoading(false);
  }

  // Success state
  if (result) {
    return (
      <div className="text-center font-inter uppercase flex flex-col items-center">
        <div className="text-3xl mb-3 font-seasons font-black text-light tracking-tighter drop-shadow-md">
          {result.status === "waitlist" ? "WAITLISTED" : "CONFIRMED"}
        </div>
        
        <p className="text-sm text-light/70 mb-8 font-semibold leading-relaxed max-w-[280px]">
          {result.status === "waitlist"
            ? `You're #${result.waitlist_position} on the waitlist. We'll email you if a spot opens.`
            : "Check your email for confirmation and details."}
        </p>

        {result.status === "confirmed" && (
          <div className="glass-panel p-6 rounded-[2rem] flex flex-col items-center w-full max-w-[260px] bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none"></div>
            <p className="text-[10px] font-bold tracking-[0.2em] mb-5 text-light/80 z-10 relative">YOUR CHECK-IN QR</p>
            <div className="p-4 bg-white/90 rounded-2xl shadow-xl z-10 relative">
              <QRCodeSVG
                value={result.qr_token}
                size={160}
                bgColor="transparent"
                fgColor="#0d0d0d"
              />
            </div>
            <p className="text-[10px] tracking-[0.2em] mt-6 text-accent animate-pulse font-bold z-10 relative">SCREENSHOT THIS</p>
          </div>
        )}
      </div>
    );
  }

  const fields = [
    { key: "name", label: "NAME", type: "text", placeholder: "YOUR NAME", required: true },
    { key: "email", label: "EMAIL", type: "email", placeholder: "YOU@EMAIL.COM", required: true },
    { key: "instagram", label: "INSTAGRAM", type: "text", placeholder: "@YOURHANDLE", required: false },
    { key: "city", label: "CITY", type: "text", placeholder: "BANGALORE", required: false },
  ];

  return (
    <div className="font-inter">
      <h2 className="text-2xl font-seasons font-black mb-8 tracking-tighter uppercase text-center text-light drop-shadow-md">
        {isFull ? "Join The Waitlist" : "Reserve Your Spot"}
      </h2>

      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <div key={f.key} className="relative group">
            <label className="text-[9px] font-bold tracking-[0.2em] text-light/50 mb-1.5 flex uppercase pl-2 transition-colors group-focus-within:text-accent">
              {f.label}
              {f.required && <span className="text-accent ml-1">*</span>}
            </label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="glass-input rounded-2xl text-sm transition-all focus:scale-[1.02]"
            />
          </div>
        ))}

        {/* Error State */}
        {error && <p className="text-red-400 font-bold font-inter mt-2 pl-2 text-sm">{error}</p>}

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 mt-6 rounded-2xl border border-accent/20 bg-accent text-dark font-seasons text-base font-bold shadow-[0_0_20px_rgba(198,255,0,0.15)] hover:shadow-[0_0_30px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          {loading ? "PROCESSING..." : isFull ? "JOIN WAITLIST →" : "RESERVE SPOT →"}
        </button>
      </div>
    </div>
  );
}
