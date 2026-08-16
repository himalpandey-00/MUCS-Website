import "server-only";
import { prisma } from "@/lib/prisma";

// Admin read queries — unlike src/lib/data.ts (public site), these are not
// filtered to PUBLISHED/active only, since the whole point of the CMS is
// to see and edit drafts/inactive rows too.

export async function getDashboardCounts() {
  const [events, news, team, announcements] = await Promise.all([
    prisma.event.count(),
    prisma.newsArticle.count(),
    prisma.teamMember.count(),
    prisma.announcement.count(),
  ]);
  return { events, news, team, announcements };
}
