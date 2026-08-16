import type { TeamMember } from "@/generated/prisma/client";
import { Avatar } from "./Avatar";

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const socials = [
    member.linkedinUrl && { label: "LinkedIn", href: member.linkedinUrl },
    member.githubUrl && { label: "GitHub", href: member.githubUrl },
    member.websiteUrl && { label: "Website", href: member.websiteUrl },
    member.email && { label: "Email", href: `mailto:${member.email}` },
  ].filter((s): s is { label: string; href: string } => Boolean(s));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
      <Avatar name={member.name} photoUrl={member.photoUrl} size={88} />
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
  );
}
