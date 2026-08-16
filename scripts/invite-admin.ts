// Invites a new committee admin: creates the Supabase Auth user via the
// Admin API (sends them an invite email with a sign-in link) and adds them
// to the AdminUser allowlist so they can actually reach /admin once they
// click it. Re-running for an already-invited email is safe — Supabase
// just reports it as already invited, and the AdminUser row is upserted.
//
// Usage: npx tsx scripts/invite-admin.ts <email> [full name]
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";

async function main() {
  const [, , email, ...nameParts] = process.argv;
  if (!email) {
    console.error("Usage: npx tsx scripts/invite-admin.ts <email> [full name]");
    process.exitCode = 1;
    return;
  }
  const name = nameParts.join(" ") || null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/admin/auth/callback`,
  });

  if (error) {
    console.warn(`inviteUserByEmail: ${error.message} (continuing — will still ensure allowlist entry)`);
  } else {
    console.log(`Invited ${email} — Supabase user ${data.user?.id}.`);
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: { name: name ?? undefined },
    create: { email, name },
  });

  console.log(`${email} is on the AdminUser allowlist.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
