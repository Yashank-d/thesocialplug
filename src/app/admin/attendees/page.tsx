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
    where: {
      bookings: {
        some: {
          status: "checked_in",
        },
      },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { instagram: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { created_at: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="uppercase font-inter relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6 relative">
        <h1 className="text-4xl md:text-5xl font-seasons font-black tracking-tighter text-light drop-shadow-md">ATTENDEES</h1>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50">
            {attendees.length} TOTAL
          </span>
          <Link
            href="/api/attendees/export"
            download
            className="text-[10px] uppercase font-bold tracking-[0.2em] bg-white/5 border border-white/10 text-light px-5 py-2.5 rounded-full hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all shadow-sm"
          >
            EXPORT CSV
          </Link>
        </div>
      </div>

      <div className="mb-8 relative z-10">
        <AttendeeSearch defaultValue={q} />
      </div>

      {attendees.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-light/50 uppercase">
            {q ? "NO RESULTS." : "NO ATTENDEES YET."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5 relative z-10">
        {attendees.map((a) => (
          <Link
            key={a.id}
            href={`/admin/attendees/${a.id}`}
            className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-white/[0.15] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
          >
            <div>
              <div className="text-2xl font-seasons font-black tracking-tighter uppercase mb-2 text-light drop-shadow-sm group-hover:text-accent transition-colors">{a.name}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 flex flex-wrap items-center gap-3">
                <span className="text-light/70">{a.email}</span>
                {a.instagram && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-light/80 backdrop-blur-sm">@{a.instagram}</span>
                  </>
                )}
                {a.city && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-light/70">{a.city}</span>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 md:mt-0 text-[9px] font-bold tracking-[0.2em] text-light/60 bg-white/5 px-4 py-2 rounded-full shrink-0 uppercase border border-white/10 backdrop-blur-sm shadow-sm self-start">
              <span className="text-accent">{a._count.bookings}</span> EVENT{a._count.bookings !== 1 ? "S" : ""}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
