import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date_time: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">events</h1>
        <Link
          href="/admin/events/new"
          className="text-xs bg-black text-white px-3 py-1.5 rounded-lg"
        >
          + new event
        </Link>
      </div>

      {events.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">no events yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {event.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    event.status === "active"
                      ? "bg-green-50 text-green-600"
                      : event.status === "completed"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {event.status}
                </span>
              </div>
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
            <div className="text-xs text-gray-400 ml-4 shrink-0">
              {event._count.bookings}/{event.capacity}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
