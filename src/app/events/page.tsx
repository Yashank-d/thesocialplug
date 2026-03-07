import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60; // Cache page for 60 seconds

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: "active" },
    orderBy: { date_time: "asc" },
    include: { 
      _count: { 
        select: { 
          bookings: {
            where: {
              status: {
                in: ["confirmed", "checked_in"]
              }
            }
          } 
        } 
      } 
    },
  });

  return (
    <div className="relative min-h-screen flex flex-col items-center py-12 px-4 md:p-8 bg-[#0D0D0D] overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="orb-container">
        <div className="orb orb-red w-125 h-125 top-[-10%] left-[-10%]"></div>
        <div className="orb orb-blue w-150 h-150 bottom-[10%] right-[-20%] opacity-40" style={{ animationDelay: '-10s' }}></div>
        <div className="orb orb-accent w-75 h-75 top-[30%] left-[20%] opacity-20" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="sr-only">thesocialplug.</h1>
          <Image
            src="/logo.svg"
            alt="thesocialplug."
            width={240}
            height={90}
            priority
            className="h-10 w-auto"
          />
          <p className="text-xs tracking-[0.2em] text-light/50 mt-4 uppercase font-bold text-center">
            irl &gt; scrolling · bangalore
          </p>
        </div>

        {events.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-3xl">
            <p className="text-light text-sm tracking-widest font-bold">NO EVENTS RIGHT NOW.</p>
            <p className="text-light/40 text-xs mt-2 tracking-widest font-bold">CHECK BACK SOON.</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {events.map((event) => {
            const spotsLeft = event.capacity - event._count.bookings;
            const isFull = spotsLeft <= 0;

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="block glass-panel rounded-4xl hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-white/15 transition-all duration-300 group"
              >
                <div className="p-8 flex flex-col">
                  {/* Top: Title */}
                  <h2 className="text-3xl md:text-4xl font-black font-seasons tracking-tighter uppercase mb-6 wrap-break-word group-hover:text-accent transition-colors">
                    {event.title}
                  </h2>
                  
                  {/* Stats line */}
                  <div className="flex justify-between items-end border-t border-white/5 pt-5 relative">
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/0 group-hover:via-accent/30 to-transparent transition-all duration-500"></div>
                    
                    <div className="flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-light/70 uppercase">
                      <span className="text-light">{new Date(event.date_time).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "2-digit",
                      })} · {new Date(event.date_time).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</span>
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="text-right text-[10px] font-bold tracking-[0.15em] uppercase">
                      {isFull ? (
                        <span className="text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">WAITLIST</span>
                      ) : (
                        <span className="text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">{spotsLeft} LEFT</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
