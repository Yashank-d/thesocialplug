"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export default function GSAPProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // We add a single event listener to handle click animations globally
    // We target a, button, or elements with role="button" or tabIndex
    const handleMouseDown = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      let isClickable = false;

      // Bubble up to find the closest clickable element
      while (target && target !== document.body) {
        if (
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("clickable")
        ) {
          isClickable = true;
          break;
        }
        target = target.parentElement;
      }

      if (isClickable && target) {
        // Subtle scale down
        gsap.to(target, {
          scale: 0.95,
          duration: 0.15,
          ease: "power2.out",
        });

        const handleMouseUp = () => {
          gsap.to(target, {
            scale: 1,
            duration: 0.4,
            ease: "elastic.out(1, 0.5)",
          });
          cleanup();
        };

        const handleMouseLeave = () => {
          gsap.to(target, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          });
          cleanup();
        };

        const cleanup = () => {
          window.removeEventListener("mouseup", handleMouseUp);
          if (target) {
            target.removeEventListener("mouseleave", handleMouseLeave);
          }
        };

        window.addEventListener("mouseup", handleMouseUp);
        target.addEventListener("mouseleave", handleMouseLeave);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [pathname]); // Re-bind on route change just in case, though document is persistent

  return null;
}
