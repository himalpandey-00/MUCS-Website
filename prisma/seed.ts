// Seeds demo/placeholder content so Phase 1 pages render real DB-backed
// data end to end. Everything here is clearly demo data:
//   - Committee names/positions are the real seed data supplied for the
//     build (bios are generic role descriptions, not personal facts —
//     no photos are attached; the UI falls back to initials avatars).
//   - Events, news, announcements, and contact details are placeholders
//     carried over from the design mock. Replace before going live.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  // ---------------------------------------------------------------------
  // Committee (real seed data — see build brief)
  // ---------------------------------------------------------------------
  const committee = [
    {
      name: "Himal Pandey Sharma",
      position: "President",
      bio: "Leads MUCS's strategic direction and represents the club to the university and industry partners.",
      displayOrder: 1,
    },
    {
      name: "Bilal Ahmad",
      position: "Vice President",
      bio: "Supports the President and coordinates the committee's day-to-day running of the club.",
      displayOrder: 2,
    },
    {
      name: "James Thorpe",
      position: "Treasurer",
      bio: "Manages club funds, sponsorships, and event budgets.",
      displayOrder: 3,
    },
  ];

  for (const member of committee) {
    await prisma.teamMember.upsert({
      where: { id: `seed-${slugify(member.name)}` },
      update: member,
      create: { id: `seed-${slugify(member.name)}`, ...member, isActive: true },
    });
  }

  // ---------------------------------------------------------------------
  // Events (placeholder demo data)
  // ---------------------------------------------------------------------
  const events = [
    {
      slug: "intro-to-network-packet-analysis",
      title: "Intro to Network Packet Analysis",
      category: "Workshop",
      summary: "Wireshark fundamentals for beginners — bring a laptop.",
      description:
        "A hands-on session covering how to capture and read network traffic with Wireshark. We'll walk through filtering, following streams, and spotting suspicious traffic patterns. No prior networking experience required.",
      location: "Murdoch IT Building, Room 2.14",
      startsAt: new Date("2026-08-27T18:00:00+08:00"),
      endsAt: new Date("2026-08-27T20:00:00+08:00"),
      status: "PUBLISHED" as const,
    },
    {
      slug: "picoctf-team-night",
      title: "picoCTF Team Night",
      category: "CTF",
      summary: "Team up and grind CTF challenges together, pizza included.",
      description:
        "Bring a laptop and team up with other members to work through picoCTF challenges. All skill levels welcome — mentors from the committee will be on hand to help unstick you.",
      location: "Student Hub, Murdoch University",
      startsAt: new Date("2026-09-10T17:00:00+08:00"),
      endsAt: new Date("2026-09-10T21:00:00+08:00"),
      status: "PUBLISHED" as const,
    },
    {
      slug: "industry-night-life-in-security",
      title: "Industry Night: Life in Security",
      category: "Talk",
      summary: "A Perth-based security consultancy on what the job actually looks like.",
      description:
        "A guest speaker from the local security industry joins us to talk about day-to-day work in penetration testing and security consulting, followed by Q&A and networking.",
      location: "Lecture Theatre 1, Murdoch University",
      startsAt: new Date("2026-09-24T18:00:00+08:00"),
      endsAt: new Date("2026-09-24T20:00:00+08:00"),
      status: "PUBLISHED" as const,
    },
    {
      slug: "semester-2-kickoff-social",
      title: "Semester 2 Kickoff Social",
      category: "Social",
      summary: "Meet the committee and other members before the semester gets busy.",
      description:
        "A casual, no-agenda meetup to kick off the semester — meet the new committee, hear what's planned, and find your CTF team.",
      location: "Student Hub, Murdoch University",
      startsAt: new Date("2026-08-06T18:00:00+08:00"),
      endsAt: new Date("2026-08-06T20:00:00+08:00"),
      status: "PUBLISHED" as const,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }

  // ---------------------------------------------------------------------
  // News articles (placeholder demo data)
  // ---------------------------------------------------------------------
  const articles = [
    {
      slug: "mucs-wins-regional-ctf-qualifier",
      title: "MUCS team places in regional CTF qualifier",
      excerpt: "A club team placed in the top brackets at a recent regional qualifier — recap and lessons learned.",
      body: "A team of MUCS members competed in a recent regional CTF qualifier, placing well against teams from other universities. This article is placeholder content — replace with a real recap, screenshots, and a shout-out to the team.",
      authorName: "MUCS Committee",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-10T09:00:00+08:00"),
    },
    {
      slug: "semester-2-whats-on",
      title: "Semester 2: what's on",
      excerpt: "Workshops, a CTF night, and an industry talk are locked in for the rest of the semester.",
      body: "Here's what the committee has planned for semester 2 — see the Events page for full details and dates. This article is placeholder content — replace with real semester planning content.",
      authorName: "MUCS Committee",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-01T09:00:00+08:00"),
    },
  ];

  for (const article of articles) {
    await prisma.newsArticle.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }

  // ---------------------------------------------------------------------
  // Announcements (placeholder demo data)
  // ---------------------------------------------------------------------
  await prisma.announcement.upsert({
    where: { id: "seed-oweek-signups" },
    update: {
      title: "O-Week sign-ups are open",
      body: "Find us at the Student Hub during O-Week to sign up — membership is free.",
      isPinned: true,
      isActive: true,
    },
    create: {
      id: "seed-oweek-signups",
      title: "O-Week sign-ups are open",
      body: "Find us at the Student Hub during O-Week to sign up — membership is free.",
      isPinned: true,
      isActive: true,
    },
  });

  // ---------------------------------------------------------------------
  // Site settings (placeholder contact/meeting details — carried over
  // from the design mock, NOT confirmed real club details. Replace via
  // Supabase before launch.)
  // ---------------------------------------------------------------------
  const settings: Record<string, string> = {
    contact_email: "murdochcybersec@gmail.com",
    meeting_schedule: "Thursdays, 6:00pm",
    meeting_location: "Student Hub, Room 1.03, Murdoch University",
    discord_url: "https://discord.gg/murdochcyber",
    instagram_handle: "@murdochcybersec",
    campus_address: "Murdoch University, 90 South St, Murdoch WA 6150",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Seed complete.");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
