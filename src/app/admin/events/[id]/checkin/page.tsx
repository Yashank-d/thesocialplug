import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CheckinClient from "@/components/admin/CheckinClient";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { status: { in: ["confirmed", "checked_in"] } },
        include: { attendee: true },
        orderBy: { attendee: { name: "asc" } },
      },
    },
  });

  if (!event) notFound();

  return <CheckinClient event={event} />;
}
