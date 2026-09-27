import type { CSSProperties } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import type { PublicGalleryPhoto } from "@/lib/gallery";
import { ScrollDrift } from "./ScrollDrift";

// How far each row slides over the band's whole trip up the screen: a
// gentle drift that scales with screen width (240px on phones, up to 520px).
const TRAVEL = "clamp(240px, 30vw, 520px)";

// Each row repeats its photos until it has at least this many tiles. A row
// must stay wider than the screen plus TRAVEL at every point of its slide,
// or a gap opens at one edge. Worst case is all-portrait photos (narrowest
// tiles, 0.75 × 240px + 16px gap = 196px): 24 of them = 4704px, which still
// covers a 3840px-wide screen plus the full 520px of travel.
const MIN_TILES_PER_ROW = 24;

type Tile = { photo: PublicGalleryPhoto; repeat: boolean };

function fillRow(photos: PublicGalleryPhoto[]): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; tiles.length < Math.max(MIN_TILES_PER_ROW, photos.length); i++) {
    tiles.push({ photo: photos[i % photos.length], repeat: i >= photos.length });
  }
  return tiles;
}

// Keep very tall or very wide photos from looking odd in a fixed-height row.
function tileAspectRatio(photo: PublicGalleryPhoto) {
  return Math.min(1.6, Math.max(0.75, photo.width / photo.height));
}

function PhotoRow({ tiles, style }: { tiles: Tile[]; style: CSSProperties }) {
  return (
    <div className="flex w-max gap-4 will-change-transform" style={style}>
      {tiles.map(({ photo, repeat }, i) => (
        <div
          key={`${photo.id}-${i}`}
          className="relative h-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-raised sm:h-52 lg:h-60"
          style={{ aspectRatio: tileAspectRatio(photo) }}
        >
          {/* Repeats exist only to fill the width — hidden from screen
              readers so each photo is announced once. */}
          <Image
            src={photo.thumbSrc}
            alt={repeat ? "" : photo.alt}
            aria-hidden={repeat || undefined}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

// Homepage photo band: two full-width rows that slide in opposite
// directions as the visitor scrolls (see ScrollDrift). Only rendered when
// getHomepageGalleryPhotos() returns photos, which it does once enough are
// marked "Show on homepage".
export function HomeGalleryBand({ photos }: { photos: PublicGalleryPhoto[] }) {
  const firstRow = fillRow(photos.filter((_, i) => i % 2 === 0));
  const secondRow = fillRow(photos.filter((_, i) => i % 2 === 1));

  return (
    <section className="overflow-hidden border-b border-border">
      <Container className="flex flex-wrap items-end justify-between gap-6 pt-20">
        <SectionHeading
          title="Life at MUCS"
          description="Workshops, CTF nights, talks and socials — a look at what we get up to."
        />
        <ButtonLink href="/gallery" variant="secondary">
          View gallery
        </ButtonLink>
      </Container>

      <ScrollDrift className="flex flex-col gap-4 pb-20 pt-10">
        <PhotoRow tiles={firstRow} style={{ transform: `translate3d(calc(var(--drift) * -1 * ${TRAVEL}), 0, 0)` }} />
        <PhotoRow
          tiles={secondRow}
          style={{ transform: `translate3d(calc((1 - var(--drift)) * -1 * ${TRAVEL}), 0, 0)` }}
        />
      </ScrollDrift>
    </section>
  );
}
