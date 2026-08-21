import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "MUCS is a student society at Murdoch University dedicated to practical security skills — penetration testing, defence, and everything in between.",
};

const PILLARS = [
  {
    title: "Workshops",
    body: "Regular hands-on sessions covering practical skills — network analysis, web exploitation, malware basics, and defensive tooling.",
  },
  {
    title: "CTF competitions",
    body: "We field teams in national and international Capture The Flag competitions, from beginner-friendly warmups to serious brackets.",
  },
  {
    title: "Industry connections",
    body: "Guest talks and networking with people working in penetration testing, security engineering, GRC, and incident response.",
  },
  {
    title: "A real community",
    body: "Weekly meetups, a Discord that's actually active, and a committee that's genuinely reachable.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="flex flex-col gap-6 py-20">
          <SectionHeading title="Who we are" />
          <div className="flex max-w-3xl flex-col gap-5 text-lg leading-relaxed text-foreground-muted">
            <p>
              The Murdoch Cyber Security Club (MUCS) is a student society dedicated to practical security
              skills — penetration testing, malware analysis, network defence, and everything in between. We
              run hands-on workshops, compete in national and international CTFs, and connect members with
              industry professionals and internship opportunities.
            </p>
            <p>No experience required. Just curiosity and a willingness to break things in a lab, not in production.</p>
          </div>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container className="grid gap-10 py-20">
          <SectionHeading title="Four things, done properly" />
          <div className="grid gap-6 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="rounded-xl border border-border bg-surface p-6">
                <h3 className="font-heading text-xl font-bold text-foreground">{pillar.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{pillar.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex flex-col items-start gap-5 py-20">
          <SectionHeading
            title="Membership is free"
            description="Open to all Murdoch students — any degree, any year. Drop into a Thursday meetup or reach out directly."
          />
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/events">See upcoming events</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact the committee
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
