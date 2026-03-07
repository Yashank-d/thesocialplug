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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-4xl mx-auto px-4">
        {/* Top Row: Logo & Sign Out */}
        <div className="flex items-center justify-between py-4">
          <Link href="/admin" className="shrink-0 flex items-center group">
            <Image
              src="/logo.svg"
              alt="thesocialplug."
              width={120}
              height={44}
              priority
              className="h-7 md:h-8 w-auto group-hover:scale-[1.02] group-hover:drop-shadow-[0_0_15px_rgba(198,255,0,0.5)] transition-all duration-300"
            />
          </Link>
          <button
            onClick={signOut}
            className="text-[9px] md:text-[10px] border border-white/10 bg-white/5 text-light px-4 py-2 rounded-full tracking-[0.2em] uppercase font-bold hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm shrink-0"
          >
            SIGN OUT
          </button>
        </div>

        {/* Bottom Row: Navigation Links */}
        <div className="flex items-center md:items-start gap-8 md:gap-8 overflow-x-auto pb-4 md:py-4 md:border-t-0 md:border-white/[0.08] no-scrollbar px-2 md:px-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[10px] uppercase tracking-[0.25em] transition-all font-bold group relative py-2 shrink-0 ${
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
    </nav>
  );
}
