import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/EventCard";
import { getPastEvents, getUpcomingEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Events",
  description: "Workshops, CTF nights, and talks run by the Murdoch Cyber Security Club.",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents(9)]);

  return (
    <>
      <section className="border-b border-border">
        <Container className="flex flex-col gap-10 py-20">
          <SectionHeading
            kicker="Events"
            title="Upcoming on the calendar"
            description="Workshops, CTF nights, and talks — open to all members."
          />
          {upcoming.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-foreground-muted">
              Nothing scheduled right now — check back soon or follow the club on Discord.
            </p>
          )}
        </Container>
      </section>

      {past.length > 0 && (
        <section>
          <Container className="flex flex-col gap-10 py-20">
            <SectionHeading kicker="Archive" title="Past events" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
