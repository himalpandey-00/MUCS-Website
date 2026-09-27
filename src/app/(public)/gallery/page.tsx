import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from MUCS workshops, CTF nights, talks and socials.",
};

const pagerLinkClasses =
  "inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-murdoch-red/60 hover:text-murdoch-red";

export default async function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;
  const { photos, page, totalPages } = await getGalleryPage(requestedPage);

  return (
    <section>
      <Container className="flex flex-col gap-10 py-20">
        <SectionHeading
          className="reveal"
          title="Gallery"
          description="Workshops, CTF nights, talks and socials — moments from around the club."
        />

        {photos.length > 0 ? (
          <GalleryGrid photos={photos} />
        ) : (
          <p className="text-foreground-muted">Photos coming soon — check back after our next event.</p>
        )}

        {totalPages > 1 && (
          <nav aria-label="Gallery pages" className="flex flex-wrap items-center justify-between gap-4">
            {page > 1 ? (
              <Link href={page === 2 ? "/gallery" : `/gallery?page=${page - 1}`} className={pagerLinkClasses}>
                ← Newer photos
              </Link>
            ) : (
              <span />
            )}
            <p className="text-sm text-foreground-muted">
              Page {page} of {totalPages}
            </p>
            {page < totalPages ? (
              <Link href={`/gallery?page=${page + 1}`} className={pagerLinkClasses}>
                Older photos →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Container>
    </section>
  );
}
