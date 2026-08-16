import { prisma } from "@/lib/prisma";

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
