import Link from "next/link";
import { getSiteSettings } from "@/lib/data";
import { Logo } from "./Logo";
import { Container } from "./ui/Container";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-border bg-surface-raised">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Logo size={40} asLink={false} />
          <p className="max-w-sm text-sm text-foreground-muted">
            A student-led community at Murdoch University for anyone serious about offensive and defensive
            security — CTFs, workshops, and a network of people who work in the field.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">Explore</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-foreground-muted hover:text-murdoch-red">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">Connect</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground-muted">
            {settings.contact_email && (
              <li>
                <a href={`mailto:${settings.contact_email}`} className="hover:text-murdoch-red">
                  {settings.contact_email}
                </a>
              </li>
            )}
            {settings.meeting_schedule && <li>{settings.meeting_schedule}</li>}
            {settings.meeting_location && <li>{settings.meeting_location}</li>}
            {settings.discord_url && (
              <li>
                <a
                  href={settings.discord_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-murdoch-red"
                >
                  Discord
                </a>
              </li>
            )}
            {settings.instagram_handle && (
              <li>
                <a
                  href={`https://instagram.com/${settings.instagram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-murdoch-red"
                >
                  {settings.instagram_handle}
                </a>
              </li>
            )}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col gap-2 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Murdoch Cyber Security Club. All rights reserved.</p>
          <p>Independent student club, Murdoch University.</p>
        </Container>
      </div>
    </footer>
  );
}
