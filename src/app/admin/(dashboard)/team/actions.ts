"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireTeamManager, canManageTeamRoster } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { uploadTeamPhoto, deleteTeamPhotoIfOwned, TeamPhotoUploadError } from "@/lib/storage/upload-team-photo";

const urlField = z.string().trim().url("Enter a valid URL.").optional().or(z.literal(""));

const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  position: z.string().trim().min(1, "Position is required.").max(120),
  bio: z.string().trim().max(2000).optional(),
  photoUrl: urlField,
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  linkedinUrl: urlField,
  githubUrl: urlField,
  websiteUrl: urlField,
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.enum(["on"]).optional(),
  isPresident: z.enum(["on"]).optional(),
});

export type TeamMemberFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof teamMemberSchema>, string[]>>;
};

function parseTeamMemberForm(formData: FormData) {
  return teamMemberSchema.safeParse({
    name: formData.get("name"),
    position: formData.get("position"),
    bio: formData.get("bio") || undefined,
    photoUrl: formData.get("photoUrl") || "",
    email: formData.get("email") || "",
    linkedinUrl: formData.get("linkedinUrl") || "",
    githubUrl: formData.get("githubUrl") || "",
    websiteUrl: formData.get("websiteUrl") || "",
    displayOrder: formData.get("displayOrder") || 0,
    isActive: formData.get("isActive") || undefined,
    isPresident: formData.get("isPresident") || undefined,
  });
}

function toData(data: z.infer<typeof teamMemberSchema>) {
  return {
    name: data.name,
    position: data.position,
    bio: data.bio || null,
    photoUrl: data.photoUrl || null,
    email: data.email || null,
    linkedinUrl: data.linkedinUrl || null,
    githubUrl: data.githubUrl || null,
    websiteUrl: data.websiteUrl || null,
    displayOrder: data.displayOrder,
    isActive: data.isActive === "on",
    isPresident: data.isPresident === "on",
  };
}

type TeamMemberData = ReturnType<typeof toData>;

// Reads the uploaded file (if any) out of the raw FormData — it's a File,
// not one of the string fields zod validates above — validates + uploads
// it, and returns the data ready to save. An uploaded file always wins
// over whatever is in the photoUrl text field (see PhotoField.tsx: that
// field stays mounted as a "paste a URL instead" fallback, so both can be
// present at once). Throws TeamPhotoUploadError on a bad/oversized file.
async function withUploadedPhoto(data: TeamMemberData, formData: FormData): Promise<TeamMemberData> {
  const photoFile = formData.get("photoFile");
  if (!(photoFile instanceof File) || photoFile.size === 0) return data;
  return { ...data, photoUrl: await uploadTeamPhoto(photoFile) };
}

// Saves the row. If isPresident is being set, every other member's flag is
// atomically cleared first inside the same transaction — so there's always
// at most one president, and no intermediate "everyone false" state is
// ever visible to a concurrent read. Returns the email of whoever *was*
// president before this save (if anyone, and if it changed), so the
// caller can drop their dashboard role back to Staff.
async function saveTeamMember(id: string | undefined, data: TeamMemberData) {
  return prisma.$transaction(async (tx) => {
    let demotedEmail: string | null = null;
    if (data.isPresident) {
      const previous = await tx.teamMember.findFirst({
        where: { isPresident: true, ...(id ? { id: { not: id } } : {}) },
        select: { email: true },
      });
      demotedEmail = previous?.email ?? null;
      await tx.teamMember.updateMany({ where: { isPresident: true }, data: { isPresident: false } });
    }

    const saved = id
      ? await tx.teamMember.update({ where: { id }, data })
      : await tx.teamMember.create({ data });

    return { saved, demotedEmail };
  });
}

// Best-effort: invites the member via Supabase Auth (same call
// scripts/invite-admin.ts uses) and upserts their AdminUser row so they
// can sign in to /admin. Never throws — a Supabase hiccup (e.g. rate
// limit) must never block saving the team member's profile. An existing
// ADMIN row is never downgraded by this — ADMIN is only ever granted via
// scripts/invite-admin.ts.
async function syncStaffAccount(member: { email: string | null; name: string; isPresident: boolean }) {
  if (!member.email) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.inviteUserByEmail(member.email, {
      redirectTo: `${siteUrl}/admin/auth/callback`,
    });
    if (error) console.warn(`inviteUserByEmail(${member.email}): ${error.message} (continuing)`);
  } catch (error) {
    console.error(`Failed to invite ${member.email}:`, error);
  }

  try {
    const existing = await prisma.adminUser.findUnique({ where: { email: member.email } });
    const role = existing?.role === "ADMIN" ? null : member.isPresident ? "PRESIDENT" : "STAFF";
    await prisma.adminUser.upsert({
      where: { email: member.email },
      update: { name: member.name, ...(role ? { role } : {}) },
      create: { email: member.email, name: member.name, role: member.isPresident ? "PRESIDENT" : "STAFF" },
    });
  } catch (error) {
    console.error(`Failed to upsert AdminUser for ${member.email}:`, error);
  }
}

// Beyond the letter of the original ask, flagged in the plan: without
// this, an ex-president would silently keep PRESIDENT-level team-manage
// access forever once someone else is checked. Guarded to PRESIDENT rows
// only, so it can never touch an ADMIN row.
async function downgradePresidentRole(email: string) {
  try {
    await prisma.adminUser.updateMany({ where: { email, role: "PRESIDENT" }, data: { role: "STAFF" } });
  } catch (error) {
    console.error(`Failed to downgrade previous president ${email}:`, error);
  }
}

// Also beyond the letter of the original ask: deleting a team member
// revokes their dashboard access too, but is guarded to never delete an
// ADMIN row — so a President-level account can't accidentally wipe the
// real admin's access just by deleting that person's team profile.
async function revokeStaffAccount(email: string | null) {
  if (!email) return;
  try {
    await prisma.adminUser.deleteMany({ where: { email, role: { not: "ADMIN" } } });
  } catch (error) {
    console.error(`Failed to remove AdminUser for ${email}:`, error);
  }
}

export async function createTeamMember(_prevState: TeamMemberFormState, formData: FormData): Promise<TeamMemberFormState> {
  await requireTeamManager(); // Only ADMIN/PRESIDENT can add team members.

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let data: TeamMemberData;
  try {
    data = await withUploadedPhoto(toData(parsed.data), formData);
  } catch (error) {
    const message = error instanceof TeamPhotoUploadError ? error.message : "Photo upload failed.";
    return { status: "error", message, fieldErrors: { photoUrl: [message] } };
  }

  let result;
  try {
    result = await saveTeamMember(undefined, data);
  } catch (error) {
    console.error("Failed to create team member:", error);
    return { status: "error", message: "Something went wrong saving this profile." };
  }

  await syncStaffAccount(result.saved);
  if (result.demotedEmail && result.demotedEmail !== result.saved.email) {
    await downgradePresidentRole(result.demotedEmail);
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
  redirect("/admin/team");
}

export async function updateTeamMember(
  id: string,
  _prevState: TeamMemberFormState,
  formData: FormData
): Promise<TeamMemberFormState> {
  const session = await requireAdmin(); // Editing stays open to every dashboard role, not just ADMIN/PRESIDENT.

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.teamMember.findUnique({ where: { id }, select: { photoUrl: true, isPresident: true } });

  // The one part of editing that ISN'T open to every role: changing who's
  // president. Checked here (not just hidden in the UI — see
  // TeamMemberForm's canManagePresident) because a hidden control is never
  // a real security boundary on its own. Only enforced if the value is
  // actually changing, so an unrelated edit (fixing a bio typo) by a Staff
  // account never trips this.
  const nextIsPresident = parsed.data.isPresident === "on";
  if (existing && nextIsPresident !== existing.isPresident && !canManageTeamRoster(session.role)) {
    const message = "Only an admin or the club president can change the Club President flag.";
    return { status: "error", message, fieldErrors: { isPresident: [message] } };
  }

  let data: TeamMemberData;
  try {
    data = await withUploadedPhoto(toData(parsed.data), formData);
  } catch (error) {
    const message = error instanceof TeamPhotoUploadError ? error.message : "Photo upload failed.";
    return { status: "error", message, fieldErrors: { photoUrl: [message] } };
  }

  let result;
  try {
    result = await saveTeamMember(id, data);
  } catch (error) {
    console.error("Failed to update team member:", error);
    return { status: "error", message: "Something went wrong saving this profile." };
  }

  if (data.photoUrl !== existing?.photoUrl) {
    await deleteTeamPhotoIfOwned(existing?.photoUrl); // Best-effort; covers both "replaced" and "cleared".
  }
  await syncStaffAccount(result.saved);
  if (result.demotedEmail && result.demotedEmail !== result.saved.email) {
    await downgradePresidentRole(result.demotedEmail);
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  await requireTeamManager(); // Only ADMIN/PRESIDENT can remove team members.
  const member = await prisma.teamMember.delete({ where: { id } });
  await revokeStaffAccount(member.email);
  revalidatePath("/admin/team");
  revalidatePath("/team");
  redirect("/admin/team");
}
