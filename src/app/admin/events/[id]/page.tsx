import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EventStatusControl from "@/components/admin/EventStatusControl";
import ManualBooking from "@/components/admin/ManualBooking";
import CancelBooking from "@/components/admin/CancelBooking";
import { getRole } from "@/lib/auth";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/admin/events"
            className="text-xs text-gray-400 hover:text-gray-600 mb-2 inline-block"
          >
            ← events
          </Link>
          <h1 className="text-xl font-bold">{event.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(event.date_time).toLocaleDateString("en-IN", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {event.location}
          </p>
        </div>
        <Link
          href={`/admin/events/${id}/checkin`}
          className="text-xs bg-black text-white px-3 py-1.5 rounded-lg shrink-0"
        >
          check-in →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: "capacity", value: event.capacity },
          { label: "confirmed", value: confirmed.length },
          { label: "waitlist", value: waitlisted.length },
          { label: "checked in", value: checkedIn.length },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-3 text-center"
          >
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status control */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">status</span>
          <EventStatusControl eventId={id} currentStatus={event.status} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">public url</span>
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="text-xs text-blue-500 hover:underline"
          >
            /events/{event.slug} ↗
          </Link>
        </div>
      </div>

      {/* Manual booking */}
      {role === "admin" && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 mb-3">add attendee manually</p>
          <ManualBooking eventId={id} />
        </div>
      )}

      {/* Bookings */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">bookings</h2>
        <Link
          href={`/admin/events/${id}/checkin`}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          open check-in mode
        </Link>
      </div>

      {event.bookings.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-400">no bookings yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {event.bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium">{booking.attendee.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {booking.attendee.email}
                {booking.attendee.instagram &&
                  ` · @${booking.attendee.instagram}`}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  booking.status === "checked_in"
                    ? "bg-green-50 text-green-600"
                    : booking.status === "confirmed"
                      ? "bg-blue-50 text-blue-600"
                      : booking.status === "waitlist"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-gray-100 text-gray-400"
                }`}
              >
                {booking.status}
              </span>
              <CancelBooking
                bookingId={booking.id}
                status={booking.status}
                visible={role === "admin"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
