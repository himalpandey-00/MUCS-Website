import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/generated/prisma/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AdminSession = {
  email: string;
  name: string | null;
  adminUserId: string;
  role: AdminRole;
};

// ADMIN and PRESIDENT can add/delete team members (see requireTeamManager
// below); STAFF can do everything else in the dashboard (Events, News,
// Announcements, Settings, and editing existing team members) but not
// that. ADMIN is granted only via scripts/invite-admin.ts — never through
// the web UI. PRESIDENT is kept in sync with whichever TeamMember has
// isPresident = true (src/app/admin/(dashboard)/team/actions.ts).
export function canManageTeamRoster(role: AdminRole): boolean {
  return role === "ADMIN" || role === "PRESIDENT";
}

// Call from the admin layout AND from individual pages that need the
// session (e.g. to greet the admin by name) — wrapped in React's cache()
// so the underlying Supabase + Prisma lookups only run once per request no
// matter how many places call it, rather than once per call site.
//
// A valid Supabase session is not enough on its own — the signed-in email
// must also have an AdminUser row (see schema.prisma). Checked fresh on
// every request rather than cached across requests, so revoking access
// (deleting the AdminUser row) takes effect immediately, not just on next
// login.
export const requireAdmin = cache(async (): Promise<AdminSession> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  const adminUser = await prisma.adminUser.findUnique({ where: { email: user.email } });
  if (!adminUser) {
    // Signed in with Supabase but not on the allowlist — don't leave a live
    // session around for an account with no purpose here.
    await supabase.auth.signOut();
    redirect("/admin/unauthorized");
  }

  if (adminUser.supabaseUserId !== user.id) {
    try {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { supabaseUserId: user.id, lastSignInAt: new Date() },
      });
    } catch (error) {
      // Bookkeeping only — never block access over it.
      console.error("Failed to record AdminUser sign-in:", error);
    }
  }

  return { email: adminUser.email, name: adminUser.name, adminUserId: adminUser.id, role: adminUser.role };
});

// Same as requireAdmin(), but additionally requires the ADMIN or PRESIDENT
// role. Use this — not requireAdmin() — for anything that should be
// restricted to team-roster management (currently: creating and deleting
// team members). Render-time gating alone (e.g. hiding a button) is not a
// security boundary since a request can be sent without going through the
// UI, so every action that needs this must call it directly, not just the
// page that renders the form.
export async function requireTeamManager(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!canManageTeamRoster(session.role)) {
    redirect("/admin/unauthorized?reason=role");
  }
  return session;
}

// Signed in via Supabase but not on the allowlist — distinct from "not
// signed in" so the login page and the guard can redirect to different
// places. Returns null (rather than redirecting) so callers that only need
// to decide *whether* to show something can do so without a hard redirect.
export async function getSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
