"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { label: "events", href: "/admin/events" },
  { label: "attendees", href: "/admin/attendees" },
  { label: "team", href: "/admin/team" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-bold tracking-tight">
            thesocialplug.
          </Link>
          <div className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-black font-medium"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          sign out
        </button>
      </div>
    </nav>
  );
}
