"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import Image from "next/image";

const adminLinks = [
  { label: "events", href: "/admin/events" },
  { label: "attendees", href: "/admin/attendees" },
  { label: "team", href: "/admin/team" },
];

const teamLinks = [{ label: "events", href: "/admin/events" }];

export default function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const links = role === "team" ? teamLinks : adminLinks;

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D] md:bg-[#0D0D0D]/70 backdrop-blur-xl border-b border-white/[0.08] px-4 py-4 uppercase font-inter shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <Link href="/admin" className="shrink-0 flex items-center group">
            <Image
              src="/logo.svg"
              alt="thesocialplug."
              width={140}
              height={52}
              priority
              className="h-8 w-auto group-hover:scale-[1.02] group-hover:drop-shadow-[0_0_15px_rgba(198,255,0,0.5)] transition-all duration-300"
            />
          </Link>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] uppercase tracking-[0.2em] transition-all font-bold group relative py-1 ${
                  pathname.startsWith(link.href)
                    ? "text-accent"
                    : "text-light/50 hover:text-light"
                }`}
              >
                {link.label}
                <div className={`absolute bottom-0 left-0 h-px bg-accent transition-all duration-300 ${pathname.startsWith(link.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-[10px] border border-white/10 bg-white/5 text-light px-4 py-2 rounded-full tracking-[0.2em] uppercase font-bold hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm"
        >
          SIGN OUT
        </button>
      </div>
    </nav>
  );
}
