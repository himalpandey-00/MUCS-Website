import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { getActiveTeamMembers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the MUCS committee — the students who run the club.",
};

export default async function TeamPage() {
  const members = await getActiveTeamMembers();

  return (
    <section>
      <Container className="flex flex-col gap-10 py-20">
        <SectionHeading
          kicker="Committee"
          title="Run by students, for students"
          description="The current committee. Reach out to any of us on Discord or via the contact page."
        />
        {members.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-foreground-muted">Committee details are being updated — check back soon.</p>
        )}
      </Container>
    </section>
  );
}
