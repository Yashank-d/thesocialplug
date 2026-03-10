"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import gsap from "gsap";
import TermsModal from "./TermsModal";

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

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && containerRef.current) {
      // First, ensure container is visible but children are hidden
      gsap.set(containerRef.current, { opacity: 1 });
      
      const elements = containerRef.current.children;
      
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.15,
          ease: "elastic.out(1, 0.6)",
        }
      );
    }
  }, [result]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("name and email are required");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions");
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

    if (res.ok) {
      setResult({
        status: data.status,
        qr_token: data.booking.qr_token,
        waitlist_position: data.waitlist_position,
      });
    } else {
      setError(data.error);
    }
    setLoading(false);
  }

  if (result) {
    return (
      <div ref={containerRef} className="text-center font-inter uppercase flex flex-col items-center opacity-0 overflow-hidden py-4">
        <div className="text-3xl mb-3 font-seasons font-black text-dark tracking-tighter">
          {result.status === "waitlist" ? "WAITLISTED" : "CONFIRMED"}
        </div>
        
        <p className="text-sm text-dark/70 mb-8 font-semibold leading-relaxed max-w-[280px]">
          {result.status === "waitlist"
            ? `You're #${result.waitlist_position} on the waitlist. We'll email you if a spot opens.`
            : "Check your email for confirmation and details."}
        </p>

        {result.status === "confirmed" && (
          <div className="bg-dark/10 border border-dark/15 p-6 rounded-[2rem] flex flex-col items-center w-full max-w-[260px] relative overflow-hidden">
            <p className="text-[10px] font-bold tracking-[0.2em] mb-5 text-dark/70">YOUR CHECK-IN QR</p>
            <div className="p-4 bg-[#0d0d0d] rounded-2xl shadow-xl border border-white/10">
              <QRCodeSVG
                value={result.qr_token}
                size={160}
                bgColor="transparent"
                fgColor="#c6ff00"
              />
            </div>
            <p className="text-[10px] tracking-[0.2em] mt-6 text-dark font-bold animate-pulse">SCREENSHOT THIS</p>
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
      <h2 className="text-2xl font-seasons font-black mb-8 tracking-tighter uppercase text-center text-dark">
        {isFull ? "Join The Waitlist" : "Reserve Your Spot"}
      </h2>

      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <div key={f.key} className="relative group">
            <label className="text-[9px] font-bold tracking-[0.2em] text-dark/60 mb-1.5 flex uppercase pl-2 transition-colors group-focus-within:text-dark">
              {f.label}
              {f.required && <span className="text-dark ml-1">*</span>}
            </label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full bg-dark/10 border border-dark/20 px-4 py-3 rounded-2xl text-sm text-dark placeholder:text-dark/30 outline-none focus:border-dark/50 focus:bg-dark/15 transition-all focus:scale-[1.02]"
            />
          </div>
        ))}

        {/* T&C Checkbox */}
        <div className="flex items-start gap-3 mt-2 px-2">
          <button
            type="button"
            onClick={() => {
              if (!termsAccepted) {
                setShowTermsModal(true);
              } else {
                setTermsAccepted(false);
              }
            }}
            className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              termsAccepted 
                ? "bg-dark border-dark text-accent" 
                : "bg-transparent border-dark/30 text-transparent hover:border-dark/60"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <p className="text-xs text-dark/70 font-medium leading-tight text-left">
            I have read and agree to the{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowTermsModal(true);
              }}
              className="text-dark font-bold underline decoration-dark/30 hover:decoration-dark underline-offset-2 transition-colors"
            >
              Terms & Conditions
            </button>
            .
          </p>
        </div>

        {/* Error State */}
        {error && (
          <p className="text-red-700 font-bold font-inter mt-3 px-2 text-[11px] uppercase tracking-widest text-center animate-pulse">
            {error}
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !termsAccepted}
          className="w-full py-4 mt-6 rounded-2xl bg-dark text-accent font-seasons text-base font-bold shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] uppercase tracking-widest"
        >
          {loading ? "PROCESSING..." : isFull ? "JOIN WAITLIST →" : "RESERVE SPOT →"}
        </button>
      </div>

      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setTermsAccepted(true)}
      />
    </div>
  );
}
