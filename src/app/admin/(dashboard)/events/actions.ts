"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

const eventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(150)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1, "Title is required.").max(200),
  category: z.string().trim().max(50).optional(),
  summary: z.string().trim().min(1, "Summary is required.").max(300),
  description: z.string().trim().min(1, "Description is required."),
  location: z.string().trim().max(200).optional(),
  // Plain <input type="datetime-local"> values, interpreted in the server's
  // local time zone. Fine for a small committee-only CMS; if MUCS ever runs
  // events across time zones this needs an explicit zone picker instead.
  startsAt: z.string().min(1, "Start date/time is required."),
  endsAt: z.string().optional(),
  coverImageUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
});

export type EventFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof eventSchema>, string[]>>;
};

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    category: formData.get("category") || undefined,
    summary: formData.get("summary"),
    description: formData.get("description"),
    location: formData.get("location") || undefined,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
    coverImageUrl: formData.get("coverImageUrl") || "",
    status: formData.get("status"),
  });
}

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<string | null> {
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) return "That slug is already in use — pick another.";
  return null;
}

export async function createEvent(_prevState: EventFormState, formData: FormData): Promise<EventFormState> {
  await requireAdmin();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const slugError = await assertSlugAvailable(data.slug);
  if (slugError) {
    return { status: "error", message: slugError, fieldErrors: { slug: [slugError] } };
  }

  try {
    await prisma.event.create({
      data: {
        slug: data.slug,
        title: data.title,
        category: data.category || null,
        summary: data.summary,
        description: data.description,
        location: data.location || null,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        coverImageUrl: data.coverImageUrl || null,
        status: data.status,
      },
    });
  } catch (error) {
    console.error("Failed to create event:", error);
    return { status: "error", message: "Something went wrong saving the event." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function updateEvent(id: string, _prevState: EventFormState, formData: FormData): Promise<EventFormState> {
  await requireAdmin();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const slugError = await assertSlugAvailable(data.slug, id);
  if (slugError) {
    return { status: "error", message: slugError, fieldErrors: { slug: [slugError] } };
  }

  try {
    await prisma.event.update({
      where: { id },
      data: {
        slug: data.slug,
        title: data.title,
        category: data.category || null,
        summary: data.summary,
        description: data.description,
        location: data.location || null,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        coverImageUrl: data.coverImageUrl || null,
        status: data.status,
      },
    });
  } catch (error) {
    console.error("Failed to update event:", error);
    return { status: "error", message: "Something went wrong saving the event." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${data.slug}`);
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  const event = await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  redirect("/admin/events");
}
