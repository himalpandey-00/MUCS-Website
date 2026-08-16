"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  body: z.string().trim().min(1, "Body is required.").max(2000),
  isPinned: z.enum(["on"]).optional(),
  isActive: z.enum(["on"]).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export type AnnouncementFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof announcementSchema>, string[]>>;
};

function parseAnnouncementForm(formData: FormData) {
  return announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    isPinned: formData.get("isPinned") || undefined,
    isActive: formData.get("isActive") || undefined,
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
  });
}

function toData(data: z.infer<typeof announcementSchema>) {
  return {
    title: data.title,
    body: data.body,
    isPinned: data.isPinned === "on",
    isActive: data.isActive === "on",
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
  };
}

export async function createAnnouncement(
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  await requireAdmin();

  const parsed = parseAnnouncementForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.announcement.create({ data: toData(parsed.data) });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return { status: "error", message: "Something went wrong saving the announcement." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(
  id: string,
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  await requireAdmin();

  const parsed = parseAnnouncementForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.announcement.update({ where: { id }, data: toData(parsed.data) });
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return { status: "error", message: "Something went wrong saving the announcement." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}
