import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookingForm from "@/components/public/BookingForm";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { _count: { select: { bookings: true } } },
  });

  if (!event || event.status === "draft") notFound();

  const spotsLeft = event.capacity - event._count.bookings;
  const isFull = spotsLeft <= 0;
  const isClosed = isFull && event.waitlist_mode === "closed";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Brand */}
        <div className="mb-10">
          <p className="text-sm font-bold tracking-tight">thesocialplug.</p>
          <p className="text-xs text-gray-400">irl &gt; scrolling</p>
        </div>

        {/* Event card */}
        <div className="border border-gray-100 rounded-2xl p-6 mb-6">
          <h1 className="text-xl font-bold mb-3">{event.title}</h1>

          <div className="flex flex-col gap-1.5 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>
                {new Date(event.date_time).toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🟢</span>
              <span className={isFull ? "text-orange-500" : "text-green-600"}>
                {isClosed
                  ? "fully booked"
                  : isFull
                    ? "full — join waitlist"
                    : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
              </span>
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-gray-400 pt-4 border-t border-gray-50">
              {event.description}
            </p>
          )}
        </div>

        {/* Booking form */}
        {isClosed ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">
              bookings are closed for this event.
            </p>
          </div>
        ) : (
          <BookingForm eventId={event.id} isFull={isFull} />
        )}
      </div>
    </div>
  );
}
