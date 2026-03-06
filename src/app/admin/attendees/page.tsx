import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AttendeeSearch from "@/components/admin/AttendeeSearch";
import { requireAdmin } from "@/lib/auth";

export default async function AttendeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireAdmin();
  const { search } = await searchParams;
  const q = search || "";

  const attendees = await prisma.attendee.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { instagram: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { created_at: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">attendees</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {attendees.length} total
          </span>
          <Link
            href="/api/attendees/export"
            download
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50"
          >
            export csv
          </Link>
        </div>
      </div>

      <AttendeeSearch defaultValue={q} />

      {attendees.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">
            {q ? "no results." : "no attendees yet."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {attendees.map((a) => (
          <Link
            key={a.id}
            href={`/admin/attendees/${a.id}`}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors"
          >
            <div>
              <div className="text-sm font-medium">{a.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {a.email}
                {a.instagram && ` · @${a.instagram}`}
                {a.city && ` · ${a.city}`}
              </div>
            </div>
            <div className="text-xs text-gray-400 shrink-0 ml-4">
              {a._count.bookings} event{a._count.bookings !== 1 ? "s" : ""}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
