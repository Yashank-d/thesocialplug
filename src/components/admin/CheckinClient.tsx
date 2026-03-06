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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-1">
          <Link
            href={`/admin/events/${event.id}`}
            className="text-xs text-gray-400"
          >
            ← back
          </Link>
          <span className="text-xs text-gray-400">
            {checkedInCount}/{bookings.length} checked in
          </span>
        </div>
        <h1 className="text-sm font-bold truncate">{event.title}</h1>

        {/* Mode toggle */}
        <div className="flex gap-1 mt-3">
          <button
            onClick={() => setMode("list")}
            className={`flex-1 py-2 text-xs rounded-lg cursor-pointer transition-all ${
              mode === "list"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            manual list
          </button>
          <button
            onClick={() => setMode("qr")}
            className={`flex-1 py-2 text-xs rounded-lg cursor-pointer transition-all ${
              mode === "qr"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            scan qr
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* QR mode */}
        {mode === "qr" && (
          <QRScanner eventId={event.id} onCheckin={handleQRCheckin} />
        )}

        {/* Manual list mode */}
        {mode === "list" && (
          <>
            <input
              type="text"
              placeholder="search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white mb-4"
            />

            <div className="flex flex-col gap-2 pb-8">
              {filtered.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white border rounded-xl p-4 flex items-center justify-between ${
                    booking.status === "checked_in"
                      ? "border-green-200"
                      : "border-gray-100"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium">
                      {booking.attendee.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {booking.attendee.email}
                      {booking.attendee.instagram &&
                        ` · @${booking.attendee.instagram}`}
                    </div>
                  </div>
                  {booking.status === "checked_in" ? (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ in
                    </span>
                  ) : (
                    <button
                      onClick={() => checkIn(booking.id)}
                      disabled={loading === booking.id}
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      {loading === booking.id ? "..." : "check in"}
                    </button>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">
                  no results.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
