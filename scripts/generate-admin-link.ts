// Generates a sign-in link WITHOUT sending an email — bypasses Supabase's
// rate-limited built-in mailer entirely (it's meant for real-user email
// delivery, not for us handing a link straight to someone in a terminal).
// Only works for an email that already has a Supabase Auth user (i.e. one
// that's been through scripts/invite-admin.ts already).
//
// Usage: npx tsx scripts/generate-admin-link.ts <email>
import "dotenv/config";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";

async function main() {
  const [, , email] = process.argv;
  if (!email) {
    console.error("Usage: npx tsx scripts/generate-admin-link.ts <email>");
    process.exitCode = 1;
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${siteUrl}/admin/auth/callback` },
  });

  if (error || !data.properties) {
    console.error("Failed to generate link:", error?.message ?? "no properties returned");
    process.exitCode = 1;
    return;
  }

  // Prefer the code: link-preview crawlers, chat unfurlers, and corporate
  // link-scanners (Outlook Safe Links etc.) can "click" a URL and burn its
  // one-time token before a human does. A plain code has nothing for an
  // automated fetcher to consume — enter it at /admin/login under
  // "Have a sign-in code?".
  console.log(`Code:  ${data.properties.email_otp}`);
  console.log(`Email: ${email}`);
  console.log(`Link (may get pre-consumed by a scanner — prefer the code above): ${data.properties.action_link}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
