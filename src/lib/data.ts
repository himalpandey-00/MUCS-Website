import { prisma } from "@/lib/prisma";
import {
  GALLERY_PAGE_SIZE,
  HOMEPAGE_GALLERY_LIMIT,
  HOMEPAGE_GALLERY_MIN,
  PUBLIC_GALLERY_PHOTO_SELECT,
  toPublicGalleryPhoto,
  type PublicGalleryPhoto,
} from "@/lib/gallery";

// Central place for every read query the public site needs. Pages import
// from here rather than calling `prisma` directly, so query shape and
// (later) caching/revalidation only need to change in one spot.

export async function getSiteSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getActiveTeamMembers() {
  return prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getActiveAnnouncements() {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function getUpcomingEvents(limit?: number) {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: limit,
  });
}

export async function getPastEvents(limit?: number) {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", startsAt: { lt: new Date() } },
    orderBy: { startsAt: "desc" },
    take: limit,
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
}

export async function getPublishedArticles(limit?: number) {
  return prisma.newsArticle.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.newsArticle.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
}

// The homepage photo band: the newest photos marked "Show on homepage". An
// empty list (not a short one) when fewer than HOMEPAGE_GALLERY_MIN are
// marked, so the band only ever appears full — never half-empty.
export async function getHomepageGalleryPhotos(): Promise<PublicGalleryPhoto[]> {
  const rows = await prisma.galleryPhoto.findMany({
    where: { showOnHomepage: true },
    orderBy: { createdAt: "desc" },
    take: HOMEPAGE_GALLERY_LIMIT,
    select: PUBLIC_GALLERY_PHOTO_SELECT,
  });
  return rows.length >= HOMEPAGE_GALLERY_MIN ? rows.map(toPublicGalleryPhoto) : [];
}

// One page of /gallery, newest first. `page` is 1-based and clamped to the
// real range, so a hand-edited ?page=999 shows the last page instead of an
// empty one.
export async function getGalleryPage(requestedPage: number) {
  const total = await prisma.galleryPhoto.count();
  const totalPages = Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), totalPages);
  const rows = await prisma.galleryPhoto.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * GALLERY_PAGE_SIZE,
    take: GALLERY_PAGE_SIZE,
    select: PUBLIC_GALLERY_PHOTO_SELECT,
  });
  return { photos: rows.map(toPublicGalleryPhoto), page, totalPages, total };
}
