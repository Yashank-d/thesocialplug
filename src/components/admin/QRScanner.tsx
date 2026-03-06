"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  success?: boolean;
  already?: boolean;
  error?: string;
  attendee?: { name: string; email: string; instagram: string | null };
}

export default function QRScanner({
  eventId,
  onCheckin,
}: {
  eventId: string;
  onCheckin: (attendeeId: string) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Wait for div to be in DOM
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  async function startScanner() {
    setResult(null);
    setScanning(true);

    // Small delay to ensure div is rendered
    await new Promise((res) => setTimeout(res, 100));

    try {
      const scanner = new Html5Qrcode("qr-scanner-container");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await handleScan(decodedText);
        },
        undefined,
      );
    } catch (err) {
      console.error("scanner error:", err);
      setScanning(false);
      setResult({ error: "could not access camera. check permissions." });
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function handleScan(qr_token: string) {
    setLoading(true);
    const res = await fetch("/api/bookings/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_token, event_id: eventId }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (data.success && data.booking?.attendee_id) {
      onCheckin(data.booking.attendee_id);
    }
  }

  function reset() {
    setResult(null);
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full relative z-10 font-inter uppercase">
      {/* Always render the container div, just hide it when not scanning */}
      <div
        id="qr-scanner-container"
        className={`w-full rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] ${scanning ? "block" : "hidden"}`}
      />

      {scanning && (
        <button
          onClick={stopScanner}
          className="w-full mt-6 bg-white/5 border border-white/10 text-light/50 hover:bg-white/10 hover:text-light transition-all rounded-full py-4 text-[10px] uppercase font-bold tracking-[0.2em]"
        >
          CANCEL
        </button>
      )}

      {loading && (
        <div className="w-full text-center py-12 glass-panel rounded-3xl mt-4">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent animate-pulse flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent"></span> CHECKING IN...
          </p>
        </div>
      )}

      {result && !loading && (
        <div
          className={`w-full glass-panel rounded-3xl p-8 mb-4 text-center mt-4 transition-all duration-500 animate-in fade-in zoom-in-95 ${
            result.success
              ? "border-accent/30 shadow-[0_0_30px_rgba(198,255,0,0.15)] bg-accent/5 mt-0"
              : result.already
                ? "border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] bg-yellow-500/5 mt-0"
                : "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] bg-red-400/5 mt-0"
          }`}
        >
          <div className="text-4xl mb-4 drop-shadow-lg">
            {result.success ? "✨" : result.already ? "⚠️" : "🚫"}
          </div>
          {result.attendee ? (
            <>
              <p className={`text-2xl font-black font-seasons tracking-tighter mb-4 pb-4 border-b border-white/10 ${
                result.success ? "text-accent" : result.already ? "text-yellow-400" : "text-red-400"
              }`}>
                {result.success
                  ? "CHECKED IN!"
                  : result.already
                    ? "ALREADY IN"
                    : "ERROR"}
              </p>
              <p className="text-xl font-black font-seasons tracking-tighter text-light drop-shadow-sm">
                {result.attendee.name}
              </p>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mt-2 flex flex-col gap-1 items-center">
                <span>{result.attendee.email}</span>
                {result.attendee.instagram && <span>@{result.attendee.instagram}</span>}
              </div>
            </>
          ) : (
            <p className="text-sm font-bold tracking-[0.2em] text-red-400 mb-2 uppercase">{result.error}</p>
          )}
          <button
            onClick={reset}
            className="w-full mt-8 bg-white/5 border border-white/10 text-light hover:bg-white/10 font-bold uppercase tracking-[0.2em] text-[10px] px-6 py-4 rounded-full transition-all shadow-sm"
          >
            SCAN NEXT →
          </button>
        </div>
      )}

      {!scanning && !loading && !result && ready && (
        <button
          onClick={startScanner}
          className="w-full bg-accent border border-accent text-dark rounded-full py-5 text-[10px] uppercase font-bold tracking-[0.2em] cursor-pointer flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all mt-4"
        >
          <span className="text-lg leading-none mb-0.5">📷</span> SCAN QR CODE
        </button>
      )}
    </div>
  );
}
