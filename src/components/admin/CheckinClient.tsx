"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import QR scanner — camera APIs need client-only
const QRScanner = dynamic(() => import("./QRScanner"), { ssr: false });

interface Attendee {
  id: string;
  name: string;
  email: string;
  instagram: string | null;
}
interface Booking {
  id: string;
  status: string;
  qr_token: string;
  attendee: Attendee;
}
interface Event {
  id: string;
  title: string;
  bookings: Booking[];
}

type Mode = "list" | "qr";

export default function CheckinClient({ event }: { event: Event }) {
  const [bookings, setBookings] = useState(event.bookings);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("list");

  const filtered = bookings.filter(
    (b) =>
      b.attendee.name.toLowerCase().includes(search.toLowerCase()) ||
      b.attendee.email.toLowerCase().includes(search.toLowerCase()),
  );

  const checkedInCount = bookings.filter(
    (b) => b.status === "checked_in",
  ).length;

  async function checkIn(bookingId: string) {
    setLoading(bookingId);
    await fetch(`/api/bookings/${bookingId}/checkin`, { method: "PUT" });
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "checked_in" } : b,
      ),
    );
    setLoading(null);
  }

  // When QR scanner checks someone in, update the local list
  function handleQRCheckin(attendeeId: string) {
    setBookings((prev) =>
      prev.map((b) =>
        b.attendee.id === attendeeId ? { ...b, status: "checked_in" } : b,
      ),
    );
  }

  return (
    <div className="min-h-screen relative z-10 font-inter uppercase text-light max-w-[800px] mx-auto">
      {/* Header */}
      <div className="glass-panel sticky top-0 z-20 px-6 py-6 rounded-b-3xl md:rounded-3xl md:mt-6 mb-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl border-x-0 md:border-x border-t-0 md:border-t">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/admin/events/${event.id}`}
            className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 hover:text-accent transition-colors"
          >
            ← BACK TO EVENT
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
            {checkedInCount}/{bookings.length} CHECKED IN
          </span>
        </div>
        <h1 className="text-2xl font-black font-seasons tracking-tighter truncate text-light drop-shadow-sm mb-6">{event.title}</h1>

        {/* Mode toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode("list")}
            className={`flex-1 py-3 text-[10px] font-bold tracking-[0.2em] rounded-full cursor-pointer transition-all border ${
              mode === "list"
                ? "bg-accent text-dark border-accent shadow-[0_0_15px_rgba(198,255,0,0.3)]"
                : "bg-white/5 text-light/60 border-white/10 hover:bg-white/10 hover:text-light"
            }`}
          >
            MANUAL LIST
          </button>
          <button
            onClick={() => setMode("qr")}
            className={`flex-1 py-3 text-[10px] font-bold tracking-[0.2em] rounded-full cursor-pointer transition-all border flex items-center justify-center gap-2 ${
              mode === "qr"
                ? "bg-accent text-dark border-accent shadow-[0_0_15px_rgba(198,255,0,0.3)]"
                : "bg-white/5 text-light/60 border-white/10 hover:bg-white/10 hover:text-light"
            }`}
          >
            <span>📷</span> SCAN QR
          </button>
        </div>
      </div>

      <div className="px-4 md:px-0 pb-12">
        {/* QR mode */}
        {mode === "qr" && (
          <div className="glass-panel rounded-3xl p-6 md:p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mb-6 pb-4 border-b border-white/10">SCAN QR CODE</h2>
            <QRScanner eventId={event.id} onCheckin={handleQRCheckin} />
          </div>
        )}

        {/* Manual list mode */}
        {mode === "list" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative mb-6 group">
               <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 block mb-2 pl-2 group-focus-within:text-accent transition-colors absolute -top-6 left-0">SEARCH</label>
              <input
                type="text"
                placeholder="NAME OR EMAIL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input rounded-2xl text-[10px] tracking-[0.2em] font-bold w-full"
              />
            </div>

            <div className="flex flex-col gap-4">
              {filtered.map((booking) => (
                <div
                  key={booking.id}
                  className={`glass-panel rounded-3xl p-6 flex items-center justify-between transition-all duration-300 hover:border-white/[0.15] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${
                    booking.status === "checked_in"
                      ? "border-accent/30 bg-accent/5"
                      : "border-white/5"
                  }`}
                >
                  <div className="pr-4">
                    <div className="text-xl font-seasons font-black tracking-tighter mb-1 text-light drop-shadow-sm">
                      {booking.attendee.name}
                    </div>
                    <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-light/50 flex flex-wrap items-center gap-2">
                      <span>{booking.attendee.email}</span>
                      {booking.attendee.instagram && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span className="text-light/70">@{booking.attendee.instagram}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {booking.status === "checked_in" ? (
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent bg-accent/10 border border-accent/20 px-4 py-2 rounded-full shadow-[0_0_10px_rgba(198,255,0,0.1)] backdrop-blur-sm shrink-0 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> IN
                    </span>
                  ) : (
                    <button
                      onClick={() => checkIn(booking.id)}
                      disabled={loading === booking.id}
                      className="text-[9px] uppercase font-bold tracking-[0.2em] text-dark bg-white border border-white px-5 py-2.5 rounded-full cursor-pointer disabled:opacity-50 hover:bg-light hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all shrink-0"
                    >
                      {loading === booking.id ? "..." : "CHECK IN"}
                    </button>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-10 glass-panel rounded-3xl border border-dashed border-white/20">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/40">
                    NO RESULTS FOUND.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
