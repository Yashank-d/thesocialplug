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
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href={`/admin/events/${id}`}
          className="text-xs text-gray-400 hover:text-gray-600 mb-2 inline-block"
        >
          ← back
        </Link>
        <h1 className="text-xl font-bold">edit event</h1>
      </div>
      <EditEventForm event={event} />
    </div>
  );
}
