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
    <div>
      <div className="mb-6">
        <Link
          href="/admin/attendees"
          className="text-xs text-gray-400 hover:text-gray-600 mb-2 inline-block"
        >
          ← attendees
        </Link>
        <h1 className="text-xl font-bold">{attendee.name}</h1>
        <div className="flex flex-col gap-0.5 mt-1">
          <p className="text-sm text-gray-400">{attendee.email}</p>
          {attendee.instagram && (
            <p className="text-sm text-gray-400">@{attendee.instagram}</p>
          )}
          {attendee.city && (
            <p className="text-sm text-gray-400">{attendee.city}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">notes</p>
        <AttendeeNotes attendeeId={id} defaultNotes={attendee.notes || ""} />
      </div>

      {/* Event history */}
      <h2 className="text-sm font-medium mb-3">
        events ({attendee.bookings.length})
      </h2>

      {attendee.bookings.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-400">no events yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {attendee.bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/admin/events/${booking.event.id}`}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors"
          >
            <div>
              <div className="text-sm font-medium">{booking.event.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(booking.event.date_time).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {booking.event.location}
              </div>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-4 ${
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
          </Link>
        ))}
      </div>
    </div>
  );
}
