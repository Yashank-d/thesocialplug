import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AttendeeNotes from "@/components/admin/AttendeeNotes";
import { requireAdmin } from "@/lib/auth";

export default async function AttendeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const attendee = await prisma.attendee.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { event: true },
        orderBy: { booked_at: "desc" },
      },
    },
  });

  if (!attendee) notFound();

  return (
    <div className="uppercase font-inter relative z-10">
      <div className="mb-10 text-center">
        <Link
          href="/admin/attendees"
          className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 hover:text-accent mb-6 inline-block transition-colors"
        >
          ← BACK TO ATTENDEES
        </Link>
        <h1 className="text-4xl md:text-5xl font-seasons font-black tracking-tighter text-light drop-shadow-md">{attendee.name}</h1>
        <div className="flex flex-col gap-2 mt-4 items-center">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent flex items-center gap-2">
            <span>{attendee.email}</span>
            {attendee.instagram && (
              <>
                <span className="w-1 h-1 rounded-full bg-accent/50"></span>
                <span>@{attendee.instagram}</span>
              </>
            )}
            {attendee.city && (
              <>
                <span className="w-1 h-1 rounded-full bg-accent/50"></span>
                <span>{attendee.city}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="glass-panel rounded-3xl p-8 mb-8 relative z-10">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mb-6 pb-4 border-b border-white/10">NOTES</p>
        <AttendeeNotes attendeeId={id} defaultNotes={attendee.notes || ""} />
      </div>

      {/* Event history */}
      <div className="mb-8 border-b border-white/10 pb-4 flex items-center justify-between mt-10 relative z-10">
        <h2 className="text-sm font-bold tracking-[0.2em] text-light/80">
          EVENTS ({attendee.bookings.length})
        </h2>
      </div>

      {attendee.bookings.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center relative z-10">
          <p className="text-xs font-bold tracking-[0.2em] text-light/50 uppercase">NO EVENTS YET.</p>
        </div>
      )}

      <div className="flex flex-col gap-5 relative z-10">
        {attendee.bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/admin/events/${booking.event.id}`}
            className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-white/[0.15] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
          >
            <div>
              <div className="text-xl md:text-2xl font-black font-seasons tracking-tighter uppercase mb-2 text-light drop-shadow-sm group-hover:text-accent transition-colors">{booking.event.title}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 flex flex-wrap items-center gap-3 mt-1">
                <span className="text-light/70">
                  {new Date(booking.event.date_time).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "2-digit",
                    year: "2-digit",
                  })}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span className="text-light/70">{booking.event.location}</span>
              </div>
            </div>
            <div className="mt-5 md:mt-0 flex shrink-0">
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
