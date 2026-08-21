import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getEventBySlug } from "@/lib/data";
import { formatEventRange } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return { title: event.title, description: event.summary };
}

export default async function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <Container className="flex flex-col gap-8 py-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{event.title}</h1>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-foreground-muted">
          <div className="flex gap-2">
            <dt className="text-muted">When</dt>
            <dd>{formatEventRange(event.startsAt, event.endsAt)}</dd>
          </div>
          {event.location && (
            <div className="flex gap-2">
              <dt className="text-muted">Where</dt>
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-foreground-muted">
        {event.description}
      </div>

      <div className="pt-4">
        <ButtonLink href="/events" variant="secondary">
          ← Back to events
        </ButtonLink>
      </div>
    </Container>
  );
}
