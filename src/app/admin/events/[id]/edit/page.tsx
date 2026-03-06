import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import EditEventForm from "@/components/admin/EditEventForm";
import Link from "next/link";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="max-w-[800px] mx-auto uppercase font-inter relative z-10 w-full mt-4 md:mt-12">
      <div className="mb-10 text-center">
        <Link
          href={`/admin/events/${id}`}
          className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 hover:text-accent mb-6 inline-block transition-colors"
        >
          ← BACK TO EVENT
        </Link>
        <h1 className="text-4xl md:text-5xl font-seasons font-black tracking-tighter text-light drop-shadow-md">EDIT EVENT</h1>
      </div>
      <EditEventForm event={event} />
    </div>
  );
}
