import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getRole } from "@/lib/auth";

export default async function EventsPage() {
  const [role, events] = await Promise.all([
    getRole(),
    prisma.event.findMany({
      orderBy: { date_time: "desc" },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: {
                  in: ["confirmed", "checked_in"],
                },
              },
            },
          },
        },
      },
    })
  ]);

  return (
    <div className="uppercase font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-white/10 pb-6 relative">
        <h1 className="text-4xl font-seasons font-black tracking-tighter text-light drop-shadow-md">EVENTS</h1>
        {role === "admin" && (
          <Link
            href="/admin/events/new"
            className="text-[10px] uppercase font-bold tracking-[0.2em] bg-accent/10 border border-accent/20 text-accent px-5 py-2.5 rounded-full hover:bg-accent hover:text-dark hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(198,255,0,0.3)] transition-all duration-300 backdrop-blur-sm shrink-0"
          >
            + NEW EVENT
          </Link>
        )}
      </div>
      
      <div className="flex flex-col gap-5 relative z-10">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-2xl font-seasons font-black tracking-tighter uppercase truncate group-hover:text-accent transition-colors drop-shadow-sm text-light">
                    {event.title}
                  </h2>
                  <span
                    className={`text-[9px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-full uppercase shrink-0 border ${
                      event.status === "active"
                        ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(198,255,0,0.1)]"
                        : event.status === "completed"
                          ? "bg-white/5 text-light/40 border-white/10"
                          : "bg-white/10 text-light border-white/20 backdrop-blur-md"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
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
              <div className="text-[10px] font-bold tracking-[0.2em] bg-white/5 border border-white/10 text-light px-4 py-2 rounded-full shrink-0 whitespace-nowrap self-start backdrop-blur-sm shadow-sm md:mt-2">
                <span className="text-accent">{event._count.bookings}</span> / {event.capacity} BOOKED
              </div>
            </div>
          </Link>
        ))}
        {events.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-[2rem]">
            <p className="text-light/60 text-xs tracking-[0.2em] font-bold uppercase">NO EVENTS FOUND.</p>
          </div>
        )}
      </div>
    </div>
  );
}
