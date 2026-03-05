import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: "active" },
    orderBy: { date_time: "asc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">thesocialplug.</h1>
          <p className="text-sm text-gray-400 mt-1">
            irl &gt; scrolling · bangalore
          </p>
        </div>

        {events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">no events right now.</p>
            <p className="text-gray-300 text-xs mt-1">check back soon.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const spotsLeft = event.capacity - event._count.bookings;
            const isFull = spotsLeft <= 0;

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold truncate">
                      {event.title}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(event.date_time).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-gray-400">{event.location}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {isFull ? (
                      <span className="text-xs text-orange-500">waitlist</span>
                    ) : (
                      <span className="text-xs text-green-500">
                        {spotsLeft} left
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
