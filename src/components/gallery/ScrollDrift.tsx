"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Exposes how far this element has travelled through the viewport as a CSS
// variable, --drift: 0 when its top edge enters at the bottom of the screen,
// 1 when its bottom edge leaves at the top. Children use it in their own
// transforms (see HomeGalleryBand), so the rows move only while the visitor
// scrolls and stop the moment they stop.
//
// Cheap by design: the scroll listener is passive, runs at most once per
// frame, and only while the element is on screen (IntersectionObserver).
// With "reduce motion" turned on in the OS, nothing is attached at all and
// --drift stays at its resting value, so the rows sit still.
export function ScrollDrift({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let onScreen = false;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = (viewport - rect.top) / (viewport + rect.height);
      element.style.setProperty("--drift", Math.min(1, Math.max(0, progress)).toFixed(4));
    };
    const requestUpdate = () => {
      if (onScreen && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      requestUpdate();
    });

    const start = () => {
      observer.observe(element);
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
    };
    const stop = () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      onScreen = false;
      element.style.setProperty("--drift", "0.5"); // resting position, same as the server render
    };
    const sync = () => {
      stop();
      if (!reducedMotion.matches) start();
    };

    sync();
    reducedMotion.addEventListener("change", sync);
    return () => {
      reducedMotion.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ "--drift": 0.5 } as CSSProperties}>
      {children}
    </div>
  );
}
