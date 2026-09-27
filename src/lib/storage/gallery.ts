import "server-only";
import { randomUUID } from "node:crypto";
import { processImage } from "@/lib/images/process-image";
import { GALLERY_BUCKET } from "./buckets";
import { removeObjects, uploadObjects } from "./objects";

// Each gallery photo is stored as two WebP files under a fresh random id:
//   <id>/large.webp — ≤1600px long edge, for the lightbox
//   <id>/thumb.webp — ≤640px long edge, for the grid and homepage band
// Pages render these as-is (next/image `unoptimized`), so no Vercel image
// optimization quota is used.

export type StoredGalleryPhoto = { imagePath: string; thumbPath: string; width: number; height: number };

/** Processes (validate, strip metadata, resize) and uploads a photo. Throws ImageProcessingError for bad input. */
export async function storeGalleryPhoto(file: File): Promise<StoredGalleryPhoto> {
  const [large, thumb] = await processImage(file, [
    { name: "large", longEdge: 1600, quality: 82 },
    { name: "thumb", longEdge: 640, quality: 78 },
  ]);

  const id = randomUUID();
  const imagePath = `${id}/large.webp`;
  const thumbPath = `${id}/thumb.webp`;
  await uploadObjects(GALLERY_BUCKET, [
    { path: imagePath, body: large.buffer, contentType: "image/webp" },
    { path: thumbPath, body: thumb.buffer, contentType: "image/webp" },
  ]);

  return { imagePath, thumbPath, width: large.width, height: large.height };
}

/** Best-effort removal of both files; never throws. */
export async function removeGalleryPhotoFiles(photo: { imagePath: string; thumbPath: string }): Promise<void> {
  await removeObjects(GALLERY_BUCKET, [photo.imagePath, photo.thumbPath]);
}
