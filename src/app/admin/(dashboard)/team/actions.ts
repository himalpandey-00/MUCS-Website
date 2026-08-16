"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

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
  };
}

export async function createTeamMember(_prevState: TeamMemberFormState, formData: FormData): Promise<TeamMemberFormState> {
  await requireAdmin();

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.teamMember.create({ data: toData(parsed.data) });
  } catch (error) {
    console.error("Failed to create team member:", error);
    return { status: "error", message: "Something went wrong saving this profile." };
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
  await requireAdmin();

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.teamMember.update({ where: { id }, data: toData(parsed.data) });
  } catch (error) {
    console.error("Failed to update team member:", error);
    return { status: "error", message: "Something went wrong saving this profile." };
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  await requireAdmin();
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/admin/team");
  revalidatePath("/team");
  redirect("/admin/team");
}
