import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/SocialLinks";
import { getSiteSettings } from "@/lib/data";
import { socialLinksFromSettings } from "@/lib/social";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Murdoch Cyber Security Club committee.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="grid gap-14 py-20 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col gap-8">
        <SectionHeading
          className="reveal"
          title="Get in touch"
          description="Questions about membership, events, or sponsorship — send us a message or reach out directly."
        />
        <dl className="flex flex-col gap-4 text-sm">
          {settings.contact_email && (
            <div>
              <dt className="text-muted">Email</dt>
              <dd>
                <a href={`mailto:${settings.contact_email}`} className="text-foreground hover:text-murdoch-red">
                  {settings.contact_email}
                </a>
              </dd>
            </div>
          )}
          {settings.meeting_schedule && (
            <div>
              <dt className="text-muted">Meetups</dt>
              <dd className="text-foreground">{settings.meeting_schedule}</dd>
            </div>
          )}
          {settings.meeting_location && (
            <div>
              <dt className="text-muted">Location</dt>
              <dd className="text-foreground">{settings.meeting_location}</dd>
            </div>
          )}
          {socialLinksFromSettings(settings).length > 0 && (
            <div>
              <dt className="text-muted">Find us online</dt>
              <dd className="mt-2">
                <SocialLinks settings={settings} />
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="reveal rounded-2xl border border-border bg-surface p-8">
        <ContactForm />
      </div>
    </Container>
  );
}
