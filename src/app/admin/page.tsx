import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
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
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">thesocialplug. admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "events", value: eventCount },
          { label: "attendees", value: attendeeCount },
          { label: "bookings", value: bookingCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">upcoming events</h2>
        <Link
          href="/admin/events/new"
          className="text-xs bg-black text-white px-3 py-1.5 rounded-lg"
        >
          + new event
        </Link>
      </div>

      {upcomingEvents.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-400">no upcoming events.</p>
          <Link
            href="/admin/events/new"
            className="text-sm font-medium mt-2 inline-block"
          >
            create your first event →
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {upcomingEvents.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors"
          >
            <div>
              <div className="text-sm font-medium">{event.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(event.date_time).toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {event.location}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {event._count.bookings}/{event.capacity}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
