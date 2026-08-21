import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/EventCard";
import { NewsCard } from "@/components/NewsCard";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { getActiveAnnouncements, getPublishedArticles, getUpcomingEvents } from "@/lib/data";

const FEATURES = [
  {
    title: "Hands-on, not theory-only",
    body: "Workshops on things like packet analysis, web exploitation, and defensive tooling — bring a laptop, break things in a lab.",
  },
  {
    title: "CTFs, as a team",
    body: "We compete together in national and international CTFs, from beginner-friendly to serious brackets.",
  },
  {
    title: "Industry connections",
    body: "Guest talks and networking with people who work in penetration testing, security engineering, and incident response.",
  },
  {
    title: "Open to everyone",
    body: "Any degree, any year, any experience level. No prior security background required — just curiosity.",
  },
];

export default async function HomePage() {
  const [announcements, upcomingEvents, articles] = await Promise.all([
    getActiveAnnouncements(),
    getUpcomingEvents(3),
    getPublishedArticles(2),
  ]);

  return (
    <>
      <AnnouncementBanner announcements={announcements} />

      {/* Hero */}
      <section className="border-b border-border">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-extrabold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Defend the network.
              <br />
              Build the skill.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-foreground-muted">
              MUCS is a student-run community for anyone serious about offensive and defensive security —
              CTFs, workshops, and a network of people who actually work in the field.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <ButtonLink href="/contact">Get Involved</ButtonLink>
              <ButtonLink href="/events" variant="secondary">
                See Events
              </ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-murdoch-red/20 blur-3xl"
            />
            <Image
              src="/brand/mucs-crest.png"
              alt="Murdoch Cyber Security Club crest"
              width={640}
              height={640}
              priority
              className="relative w-full max-w-[320px] rounded-full shadow-2xl"
            />
          </div>
        </Container>
      </section>

      {/* Why join */}
      <section className="border-b border-border">
        <Container className="grid gap-10 py-20">
          <SectionHeading
            title="Run by students, backed by the field"
            description="No experience required. Just curiosity and a willingness to break things in a lab, not in production."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-surface p-6">
                <h3 className="font-heading text-lg font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Upcoming events */}
      <section className="border-b border-border">
        <Container className="flex flex-col gap-10 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title="Upcoming on the calendar" />
            <ButtonLink href="/events" variant="secondary">
              View all events
            </ButtonLink>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-foreground-muted">No upcoming events right now — check back soon.</p>
          )}
        </Container>
      </section>

      {/* News */}
      {articles.length > 0 && (
        <section className="border-b border-border">
          <Container className="flex flex-col gap-10 py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading title="From the club" />
              <ButtonLink href="/news" variant="secondary">
                View all news
              </ButtonLink>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="bg-murdoch-red">
        <Container className="flex flex-col items-start gap-5 py-16 text-white">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Join the club</h2>
          <p className="max-w-xl text-white/90">
            Membership is free and open to all Murdoch students, any degree, any year. Sign up at O-Week or
            drop into a Thursday meetup.
          </p>
          {/* Not <ButtonLink variant="secondary">: that variant's own
              text-foreground/border-border classes and these override
              classes both set the same properties, and which one wins is
              decided by Tailwind's internal utility order, not by where
              they sit in this class string — that's what produced the
              white-on-white bug here. A self-contained className sidesteps
              the conflict entirely. */}
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white bg-white px-5 py-2.5 text-sm font-heading font-bold uppercase tracking-wide text-deep-red transition-colors duration-150 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-murdoch-red"
          >
            Get in touch
          </Link>
        </Container>
      </section>
    </>
  );
}
