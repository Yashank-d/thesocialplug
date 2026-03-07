"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Buttery smooth, elegant entrance
    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 8,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.inOut",
        clearProps: "all"
      }
    );
  }, [pathname]);

  return <div ref={containerRef}>{children}</div>;
}
