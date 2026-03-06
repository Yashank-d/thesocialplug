import { requireAdmin } from "@/lib/auth";

export default async function NewEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}
