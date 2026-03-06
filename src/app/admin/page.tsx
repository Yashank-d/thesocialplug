import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import Image from "next/image";

export default async function AdminPage() {
  await requireAdmin();
  const [eventCount, attendeeCount, bookingCount] = await Promise.all([
    prisma.event.count(),
    prisma.attendee.count(),
    prisma.booking.count(),
  ]);

  const upcomingEvents = await prisma.event.findMany({
    where: { status: "active", date_time: { gte: new Date() } },
    orderBy: { date_time: "asc" },
    take: 3,
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="uppercase font-inter">
      <div className="mb-12 border-b border-white/10 pb-6 relative">
        <h1 className="text-4xl font-black font-seasons tracking-tighter text-light drop-shadow-md">DASHBOARD</h1>
        <div className="flex items-center gap-2 mt-3 mb-1">
          <Image src="/logo.svg" alt="thesocialplug." width={90} height={34} className="h-4 w-auto opacity-70 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent leading-none pt-1">ADMIN PORTAL</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-16 relative z-10">
        {[
          { label: "TOTAL EVENTS", value: eventCount },
          { label: "ATtendees", value: attendeeCount },
          { label: "BOOKINGS", value: bookingCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-panel rounded-[2rem] p-8 flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-white/[0.15] transition-all duration-300"
          >
            <div className="text-5xl font-black font-seasons tracking-tighter mb-3 text-light drop-shadow-md">{stat.value}</div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-[0.2em] text-light/80">UPCOMING EVENTS</h2>
        <Link
          href="/admin/events/new"
          className="text-[10px] font-bold tracking-[0.2em] bg-accent/10 border border-accent/20 text-accent px-5 py-2.5 rounded-full hover:bg-accent hover:text-dark hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(198,255,0,0.3)] transition-all duration-300 backdrop-blur-sm"
        >
          + NEW EVENT
        </Link>
      </div>

      {upcomingEvents.length === 0 && (
        <div className="glass-panel rounded-[2rem] p-12 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-light/50 mb-4">NO UPCOMING EVENTS.</p>
          <Link
            href="/admin/events/new"
            className="text-[10px] font-bold tracking-[0.2em] text-accent bg-accent/10 border border-accent/20 px-6 py-3 rounded-full inline-block hover:bg-accent hover:text-dark transition-all duration-300 hover:shadow-[0_0_15px_rgba(198,255,0,0.2)]"
          >
            CREATE YOUR FIRST EVENT →
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {upcomingEvents.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-white/[0.15] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
          >
            <div>
              <div className="text-2xl font-black font-seasons tracking-tighter uppercase mb-3 group-hover:text-accent transition-colors drop-shadow-sm">{event.title}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 flex flex-wrap gap-2 items-center">
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
              </div>
            </div>
            <div className="mt-5 md:mt-0 text-[10px] font-bold bg-white/5 border border-white/10 text-light px-4 py-2 rounded-full shrink-0 text-center tracking-[0.2em] backdrop-blur-sm shadow-sm">
              <span className="text-accent">{event._count.bookings}</span> / {event.capacity} BOOKED
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
