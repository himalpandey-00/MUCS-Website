import Image from "next/image";
import type { TeamMember } from "@/generated/prisma/client";
import { initials, isOwnBucketPhoto } from "./Avatar";

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const socials = [
    member.linkedinUrl && { label: "LinkedIn", href: member.linkedinUrl },
    member.githubUrl && { label: "GitHub", href: member.githubUrl },
    member.websiteUrl && { label: "Website", href: member.websiteUrl },
    member.email && { label: "Email", href: `mailto:${member.email}` },
  ].filter((s): s is { label: string; href: string } => Boolean(s));

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface">
      {/* Photo block — fills this half edge to edge, no padding, clipped to
          the card's rounded corners via the parent's overflow-hidden. */}
      <div className="relative aspect-square w-full bg-surface-raised">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            unoptimized={!isOwnBucketPhoto(member.photoUrl)}
            className="object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={member.name}
            className="flex h-full w-full items-center justify-center font-heading text-5xl font-extrabold text-muted"
          >
            {initials(member.name)}
          </div>
        )}
      </div>

      {/* Info block — the other half. */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">{member.name}</h3>
          <p className="text-sm font-medium text-murdoch-red">{member.position}</p>
        </div>
        {member.bio && <p className="text-sm text-foreground-muted">{member.bio}</p>}
        {socials.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-3 pt-2">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer noopener"
                  className="text-xs font-medium uppercase tracking-wide text-teal hover:text-murdoch-red"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
