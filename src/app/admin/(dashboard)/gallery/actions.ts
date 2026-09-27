"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { ImageProcessingError } from "@/lib/images/process-image";
import { removeGalleryPhotoFiles, storeGalleryPhoto } from "@/lib/storage/gallery";

// Gallery management is open to every dashboard role (same as Events and
// News), so every action here checks requireAdmin() — never just the page
// that renders the controls, since a hidden button isn't a security boundary.

const captionField = z.string().trim().max(200, "Keep captions under 200 characters.").optional();

function revalidateGallery() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export type UploadGalleryPhotoResult = { ok: true } | { ok: false; error: string };

// One photo per call: GalleryUploader.tsx sends a batch one at a time, so a
// batch never has to fit in a single request (Vercel caps a request body at
// 4.5 MB). Returns a result instead of redirecting so the uploader can show
// per-photo progress and carry on with the rest of the batch.
export async function uploadGalleryPhoto(formData: FormData): Promise<UploadGalleryPhotoResult> {
  const session = await requireAdmin();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No photo was received." };

  const caption = captionField.safeParse(formData.get("caption") || undefined);
  if (!caption.success) return { ok: false, error: caption.error.issues[0]?.message ?? "Invalid caption." };

  let stored;
  try {
    stored = await storeGalleryPhoto(file);
  } catch (error) {
    if (error instanceof ImageProcessingError) return { ok: false, error: error.message };
    console.error("Gallery photo upload failed:", error);
    return { ok: false, error: "Upload failed — try again." };
  }

  try {
    await prisma.galleryPhoto.create({
      data: { ...stored, caption: caption.data || null, uploadedById: session.adminUserId },
    });
  } catch (error) {
    console.error("Failed to save gallery photo:", error);
    await removeGalleryPhotoFiles(stored); // don't leave orphaned files behind
    return { ok: false, error: "Couldn't save the photo — try again." };
  }

  revalidateGallery();
  return { ok: true };
}

const photoDetailsSchema = z.object({
  caption: captionField,
  showOnHomepage: z.enum(["on"]).optional(),
});

export type GalleryPhotoFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof photoDetailsSchema>, string[]>>;
};

export async function updateGalleryPhoto(
  id: string,
  _prevState: GalleryPhotoFormState,
  formData: FormData
): Promise<GalleryPhotoFormState> {
  await requireAdmin();

  const parsed = photoDetailsSchema.safeParse({
    caption: formData.get("caption") || undefined,
    showOnHomepage: formData.get("showOnHomepage") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.galleryPhoto.update({
      where: { id },
      data: { caption: parsed.data.caption || null, showOnHomepage: parsed.data.showOnHomepage === "on" },
    });
  } catch (error) {
    console.error("Failed to update gallery photo:", error);
    return { status: "error", message: "Something went wrong saving this photo." };
  }

  revalidateGallery();
  redirect("/admin/gallery");
}

// Quick show/hide straight from the gallery grid, without opening the edit page.
export async function setGalleryPhotoOnHomepage(id: string, showOnHomepage: boolean) {
  await requireAdmin();
  await prisma.galleryPhoto.updateMany({ where: { id }, data: { showOnHomepage } });
  revalidateGallery();
}

export async function deleteGalleryPhoto(id: string) {
  await requireAdmin();
  const photo = await prisma.galleryPhoto.findUnique({ where: { id }, select: { imagePath: true, thumbPath: true } });
  if (photo) {
    await prisma.galleryPhoto.delete({ where: { id } });
    await removeGalleryPhotoFiles(photo); // best-effort, after the row is gone
  }
  revalidateGallery();
  redirect("/admin/gallery");
}
