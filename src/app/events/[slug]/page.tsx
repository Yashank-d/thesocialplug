import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookingForm from "@/components/public/BookingForm";
import Image from "next/image";
import Link from "next/link";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { _count: { select: { bookings: true } } },
  });

  if (!event || event.status === "draft") notFound();

  const spotsLeft = event.capacity - event._count.bookings;
  const isFull = spotsLeft <= 0;
  const isClosed = isFull && event.waitlist_mode === "closed";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 py-12 md:p-8 bg-[#0D0D0D] overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="orb-container">
        <div className="orb orb-accent w-[500px] h-[500px] top-[10%] left-[-10%] opacity-20"></div>
        <div className="orb orb-blue w-[600px] h-[600px] bottom-[-10%] right-[-10%] opacity-30" style={{ animationDelay: '-8s' }}></div>
      </div>

      {/* Brand Header */}
      <div className="w-full max-w-md flex justify-between items-end text-accent relative z-10 mb-8 mt-4">
        <Link href="/events" className="block shrink-0">
          <Image
            src="/logo.svg"
            alt="thesocialplug."
            width={160}
            height={60}
            priority
            className="h-8 w-auto hover:opacity-80 transition-opacity"
          />
        </Link>
        <span className="text-[10px] tracking-[0.2em] uppercase block font-bold text-light/50">irl &gt; scrolling</span>
      </div>

      {/* The Glass Panel */}
      <div className="w-full max-w-md glass-panel rounded-[2.5rem] p-8 md:p-10 relative z-10 flex flex-col">
        {/* Top Section - Large Title */}
        <div className="mb-10">
          <h1 className="font-seasons text-5xl md:text-6xl font-black leading-none tracking-tighter uppercase mb-8 break-words text-light drop-shadow-lg">
            {event.title}
          </h1>
          
          <div className="flex flex-col gap-4 text-sm font-semibold tracking-wide text-light/80">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-light/40 uppercase text-[10px] tracking-widest">Location</span>
              <span className="text-right max-w-[60%] font-inter text-base">{event.location}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-light/40 uppercase text-[10px] tracking-widest">Date & Time</span>
              <span className="text-right font-inter text-base">
                {new Date(event.date_time).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "2-digit",
                })} · {new Date(event.date_time).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-light/40 uppercase text-[10px] tracking-widest">Status</span>
              <div className="text-right text-[10px] font-bold tracking-[0.15em] uppercase">
                {isClosed ? (
                  <span className="text-red-400">CLOSED</span>
                ) : isFull ? (
                  <span className="text-red-400">WAITLIST ONLY</span>
                ) : (
                  <span className="text-accent">{spotsLeft} SPOTS LEFT</span>
                )}
              </div>
            </div>
          </div>

          {event.description && (
            <div className="mt-8 text-sm leading-relaxed text-light/60 font-inter text-base">
              {event.description}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full mb-10"></div>

        {/* Bottom Section - Booking Form Wrapper */}
        <div className="pt-2">
          {isClosed ? (
            <div className="text-center py-6 glass-panel rounded-2xl">
              <p className="text-xs font-bold tracking-[0.2em] text-light/40 uppercase">
                Bookings Closed
              </p>
            </div>
          ) : (
            <BookingForm eventId={event.id} isFull={isFull} />
          )}
        </div>
      </div>
    </div>
  );
}
