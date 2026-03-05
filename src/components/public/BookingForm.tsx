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
      <div className="border border-gray-100 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-4">
          {result.status === "waitlist" ? "🟡" : "🟢"}
        </div>
        <h2 className="text-lg font-bold mb-2">
          {result.status === "waitlist"
            ? "you're on the waitlist."
            : "you're in."}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {result.status === "waitlist"
            ? `you're #${result.waitlist_position} on the waitlist. we'll email you if a spot opens.`
            : "check your email for confirmation. see you there."}
        </p>

        {result.status === "confirmed" && (
          <>
            <p className="text-xs text-gray-400 mb-3">your check-in qr</p>
            <div className="flex justify-center">
              <div className="p-4 border border-gray-100 rounded-xl inline-block">
                <QRCodeSVG
                  value={result.qr_token}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-3">screenshot this</p>
          </>
        )}
      </div>
    );
  }

  const fields = [
    {
      key: "name",
      label: "name",
      type: "text",
      placeholder: "your name",
      required: true,
    },
    {
      key: "email",
      label: "email",
      type: "email",
      placeholder: "you@email.com",
      required: true,
    },
    {
      key: "instagram",
      label: "instagram (optional)",
      type: "text",
      placeholder: "@yourhandle",
      required: false,
    },
    {
      key: "city",
      label: "city (optional)",
      type: "text",
      placeholder: "bangalore",
      required: false,
    },
  ];

  return (
    <div className="border border-gray-100 rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-4">
        {isFull ? "join the waitlist." : "reserve your spot."}
      </h2>

      <div className="flex flex-col gap-3">
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

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer mt-1"
        >
          {loading ? "booking..." : isFull ? "join waitlist →" : "show up →"}
        </button>
      </div>
    </div>
  );
}
