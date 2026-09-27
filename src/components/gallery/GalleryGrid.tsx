"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PublicGalleryPhoto } from "@/lib/gallery";

// The /gallery grid plus a lightbox. Each tile is a real link to the full
// photo, so everything still works with JavaScript off; with JS, clicking
// opens a native <dialog> instead, which brings focus trapping, Esc to
// close and an inert page behind it for free. Arrow keys / buttons / a
// horizontal swipe move between photos, and focus goes back to the tile
// that opened it (done explicitly: Safari doesn't focus a link on click,
// so the browser's own restore would otherwise drop focus on the page).
export function GalleryGrid({ photos }: { photos: PublicGalleryPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tileRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const openerRef = useRef<HTMLAnchorElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const count = photos.length;
  const current = index === null ? null : photos[index];

  // Functional update, so several steps in a row (e.g. a held arrow key)
  // never read a stale position. Wraps around at both ends.
  function step(delta: number) {
    setIndex((i) => (i === null ? i : (((i + delta) % count) + count) % count));
  }

  function open(i: number) {
    openerRef.current = tileRefs.current[i];
    setIndex(i);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  // Warm the browser cache for the neighbours so next/previous feel instant.
  useEffect(() => {
    if (index === null || count < 2) return;
    for (const neighbour of [photos[(index + 1) % count], photos[(index - 1 + count) % count]]) {
      const preload = new window.Image();
      preload.src = neighbour.src;
    }
  }, [index, count, photos]);

  return (
    <>
      <ul className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {photos.map((photo, i) => (
          <li key={photo.id} className="reveal mb-4 break-inside-avoid">
            <a
              ref={(element) => {
                tileRefs.current[i] = element;
              }}
              href={photo.src}
              onClick={(event) => {
                event.preventDefault();
                open(i);
              }}
              className="group block overflow-hidden rounded-2xl border border-border bg-surface-raised"
            >
              <Image
                src={photo.thumbSrc}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                unoptimized
                className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onClose={() => {
          openerRef.current?.focus();
          setIndex(null);
        }}
        onClick={(event) => {
          // A click on the dim backdrop (the dialog element itself, not its content) closes it.
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          const end = event.changedTouches[0]?.clientX;
          touchStartX.current = null;
          if (start === null || end === undefined || Math.abs(end - start) < 50) return;
          step(end < start ? 1 : -1);
        }}
        className="m-auto h-full max-h-none w-full max-w-none bg-transparent p-0 text-white backdrop:bg-black/85"
      >
        {current && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 sm:p-8">
            <div className="flex w-full max-w-6xl items-center justify-between gap-4 text-sm">
              <p aria-live="polite">
                {index! + 1} / {count}
              </p>
              <button
                type="button"
                onClick={close}
                autoFocus
                aria-label="Close photo viewer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 hover:bg-white/10"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center gap-2 sm:gap-4">
              {count > 1 && (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 hover:bg-white/10 sm:inline-flex"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
              )}
              <Image
                key={current.id}
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                unoptimized
                className="h-auto max-h-full w-auto max-w-full rounded-lg object-contain"
              />
              {count > 1 && (
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 hover:bg-white/10 sm:inline-flex"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex w-full max-w-6xl items-center justify-between gap-4">
              {count > 1 && (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="rounded-full border border-white/40 px-4 py-2 text-sm hover:bg-white/10 sm:hidden"
                >
                  Previous
                </button>
              )}
              <p className="min-w-0 flex-1 text-center text-sm text-white/90">{current.caption}</p>
              {count > 1 && (
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="rounded-full border border-white/40 px-4 py-2 text-sm hover:bg-white/10 sm:hidden"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
