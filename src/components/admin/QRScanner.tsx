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
    <div className="flex flex-col items-center w-full">
      {/* Always render the container div, just hide it when not scanning */}
      <div
        id="qr-scanner-container"
        className={`w-full rounded-xl overflow-hidden ${scanning ? "block" : "hidden"}`}
      />

      {scanning && (
        <button
          onClick={stopScanner}
          className="w-full mt-3 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-500 cursor-pointer"
        >
          cancel
        </button>
      )}

      {loading && (
        <div className="w-full text-center py-8">
          <p className="text-sm text-gray-400">checking in...</p>
        </div>
      )}

      {result && !loading && (
        <div
          className={`w-full border rounded-xl p-5 mb-4 text-center ${
            result.success
              ? "border-green-200 bg-green-50"
              : result.already
                ? "border-yellow-200 bg-yellow-50"
                : "border-red-200 bg-red-50"
          }`}
        >
          <div className="text-2xl mb-2">
            {result.success ? "✅" : result.already ? "🟡" : "❌"}
          </div>
          {result.attendee ? (
            <>
              <p className="text-sm font-bold">
                {result.success
                  ? "checked in!"
                  : result.already
                    ? "already checked in"
                    : "error"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {result.attendee.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {result.attendee.email}
              </p>
            </>
          ) : (
            <p className="text-sm text-red-600">{result.error}</p>
          )}
          <button
            onClick={reset}
            className="mt-4 text-xs bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            scan next →
          </button>
        </div>
      )}

      {!scanning && !loading && !result && ready && (
        <button
          onClick={startScanner}
          className="w-full bg-black text-white rounded-xl py-4 text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
        >
          <span>📷</span> scan qr code
        </button>
      )}
    </div>
  );
}
