"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Portal from "@radix-ui/react-portal";

export default function CancelBooking({
  bookingId,
  status,
  visible,
}: {
  bookingId: string;
  status: string;
  visible: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  if (!visible || status === "cancelled" || status === "checked_in")
    return null;

  async function handleCancel() {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/cancel`, { method: "PUT" });
    setLoading(false);
    setShowModal(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-light/40 hover:text-red-400 hover:bg-red-900/20 px-4 py-2 rounded-full transition-all uppercase cursor-pointer disabled:opacity-50"
      >
        CANCEL
      </button>

      {/* Custom Confirmation Modal via Portal */}
      {showModal && (
        <Portal.Root>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => !loading && setShowModal(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative glass-panel bg-[#0D0D0D]/90 p-8 rounded-3xl max-w-[360px] w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="font-seasons text-2xl font-black text-light tracking-tighter uppercase mb-3">
                Cancel Booking?
              </h3>
              <p className="text-light/60 text-sm mb-8 font-inter leading-relaxed">
                This action cannot be undone. Waitlist attendees will be automatically promoted if spots open up.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-red-500/10 text-red-500 font-inter text-xs font-bold tracking-[0.2em] uppercase border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
                >
                  {loading ? "CANCELLING..." : "YES, CANCEL IT"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-white/5 text-light font-inter text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  KEEP BOOKING
                </button>
              </div>
            </div>
          </div>
        </Portal.Root>
      )}
    </>
  );
}

