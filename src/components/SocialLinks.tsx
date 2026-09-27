import { socialLinksFromSettings } from "@/lib/social";
import { SocialIcon } from "./icons/social";

// Row of round social icons linking to the club's profiles. Only platforms
// with a valid link under Admin → Settings appear; renders nothing if none
// are set. Used in the footer and on the contact page.
export function SocialLinks({ settings, className }: { settings: Record<string, string>; className?: string }) {
  const links = socialLinksFromSettings(settings);
  if (links.length === 0) return null;

  return (
    <ul aria-label="MUCS on social media" className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {links.map(({ platform, href }) => (
        <li key={platform.key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`MUCS on ${platform.name} (opens in a new tab)`}
            title={platform.name}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted transition-colors hover:border-murdoch-red/60 hover:text-murdoch-red"
          >
            <SocialIcon name={platform.icon} className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
