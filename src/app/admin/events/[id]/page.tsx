import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EventStatusControl from "@/components/admin/EventStatusControl";
import ManualBooking from "@/components/admin/ManualBooking";
import CancelBooking from "@/components/admin/CancelBooking";
import { getRole } from "@/lib/auth";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ show_cancelled?: string }>;
}) {
  const { id } = await params;
  const { show_cancelled } = await searchParams;
  const showCancelled = show_cancelled === "true";
  const role = await getRole();
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { attendee: true },
        orderBy: { booked_at: "asc" },
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!event) notFound();

  const confirmed = event.bookings.filter(
    (b) => b.status === "confirmed" || b.status === "checked_in",
  );
  const waitlisted = event.bookings.filter((b) => b.status === "waitlist");
  const checkedIn = event.bookings.filter((b) => b.status === "checked_in");

  const displayBookings = showCancelled
    ? event.bookings
    : event.bookings.filter((b) => b.status !== "cancelled");

  return (
    <div className="uppercase font-inter relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 border-b border-white/10 pb-6 relative">
        <div>
          <Link
            href="/admin/events"
            className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 hover:text-accent mb-6 inline-block transition-colors"
          >
            ← BACK TO EVENTS
          </Link>
          <h1 className="text-4xl md:text-5xl font-seasons font-black tracking-tighter uppercase text-light drop-shadow-md">{event.title}</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-light/70">{new Date(event.date_time).toLocaleDateString("en-IN", {
              month: "short",
              day: "2-digit",
              year: "2-digit",
            })}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="text-light/70">{new Date(event.date_time).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>{event.location}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-10">
          {role === "admin" && (
            <Link
              href={`/admin/events/${id}/edit`}
              className="text-[10px] uppercase font-bold tracking-[0.2em] bg-white/5 border border-white/10 text-light px-6 py-3 rounded-full hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
            >
              EDIT
            </Link>
          )}
          <Link
            href={`/admin/events/${id}/checkin`}
            className="text-[10px] uppercase font-bold tracking-[0.2em] bg-accent/10 border border-accent/20 text-accent px-6 py-3 rounded-full hover:bg-accent hover:text-dark hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(198,255,0,0.3)] transition-all duration-300 backdrop-blur-sm"
          >
            CHECK-IN →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
        {[
          { label: "CAPACITY", value: event.capacity },
          { label: "CONFIRMED", value: confirmed.length },
          { label: "WAITLIST", value: waitlisted.length },
          { label: "CHECKED IN", value: checkedIn.length },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-white/[0.15] transition-all duration-300"
          >
            <div className="text-3xl md:text-5xl font-black font-seasons tracking-tighter mb-3 text-light drop-shadow-md">{s.value}</div>
            <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-light/50">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 relative z-10">
        {/* Status control */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50">STATUS</span>
            <div className="scale-90 origin-right">
              <EventStatusControl eventId={id} currentStatus={event.status} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-white/10 pt-6 gap-4">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50">PUBLIC URL</span>
            <Link
              href={`/events/${event.slug}`}
              target="_blank"
              className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent bg-accent/10 border border-accent/20 px-4 py-2 rounded-full hover:bg-accent hover:text-dark transition-all duration-300 backdrop-blur-sm whitespace-nowrap text-center"
            >
              /EVENTS/{event.slug} ↗
            </Link>
          </div>
        </div>

        {/* Manual booking */}
        {role === "admin" && (
          <div className="glass-panel rounded-3xl p-8">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mb-6 pb-4 border-b border-white/10">ADD ATTENDEE MANUALLY</p>
            <ManualBooking eventId={id} />
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="mb-8 border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold tracking-[0.2em] text-light/80">BOOKINGS</h2>
          <Link
            href={`/admin/events/${id}?show_cancelled=${showCancelled ? 'false' : 'true'}`}
            className="text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-light/60"
          >
            {showCancelled ? 'HIDE CANCELLED' : 'SHOW CANCELLED'}
          </Link>
        </div>
        <Link
          href={`/admin/events/${id}/checkin`}
          className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 hover:text-accent transition-colors underline underline-offset-4"
        >
          OPEN CHECK-IN MODE
        </Link>
      </div>

      {displayBookings.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-light/50 uppercase">NO BOOKINGS YET.</p>
        </div>
      )}

      <div className="flex flex-col gap-5 relative z-10">
        {displayBookings.map((booking) => (
          <div
            key={booking.id}
            className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300"
          >
            <div>
              <div className="text-xl md:text-2xl font-black font-seasons tracking-tighter uppercase mb-2 text-light drop-shadow-sm">{booking.attendee.name}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 flex flex-wrap items-center gap-3">
                <span className="text-light/70">{booking.attendee.email}</span>
                {booking.attendee.instagram && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-light/80 backdrop-blur-sm">@{booking.attendee.instagram}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-6 md:mt-0 shrink-0">
              <span
                className={`text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-2 rounded-full border ${
                  booking.status === "checked_in"
                    ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(198,255,0,0.1)]"
                    : booking.status === "confirmed"
                      ? "bg-white/10 text-light border-white/20 backdrop-blur-md"
                      : booking.status === "waitlist"
                        ? "bg-white/5 text-light/40 border-white/10"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {booking.status}
              </span>
              <div className="scale-90 origin-right">
                <CancelBooking
                  bookingId={booking.id}
                  status={booking.status}
                  visible={role === "admin"}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
