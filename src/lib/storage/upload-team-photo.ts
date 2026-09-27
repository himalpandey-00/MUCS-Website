import "server-only";
import { randomUUID } from "node:crypto";
import { ImageProcessingError, processImage } from "@/lib/images/process-image";
import { TEAM_PHOTOS_BUCKET, pathFromPublicUrl, publicStorageUrl } from "./buckets";
import { removeObjects, uploadObjects } from "./objects";

// Thrown for validation/upload failures that should surface as a form
// error (see src/app/admin/(dashboard)/team/actions.ts) rather than a
// generic 500.
export class TeamPhotoUploadError extends Error {}

// Runs the photo through the shared pipeline (src/lib/images/
// process-image.ts: real decode check, EXIF rotation, metadata stripped,
// ≤800px WebP) and uploads it to the public team-photos bucket. Returns the
// public URL to store on TeamMember.photoUrl.
export async function uploadTeamPhoto(file: File): Promise<string> {
  let photo;
  try {
    [photo] = await processImage(file, [{ name: "photo", longEdge: 800, quality: 82 }]);
  } catch (error) {
    if (error instanceof ImageProcessingError) throw new TeamPhotoUploadError(error.message);
    throw error;
  }

  const path = `${randomUUID()}.webp`;
  try {
    await uploadObjects(TEAM_PHOTOS_BUCKET, [{ path, body: photo.buffer, contentType: "image/webp" }]);
  } catch (error) {
    console.error("Team photo upload failed:", error);
    throw new TeamPhotoUploadError("Upload failed. Try again, or paste an image URL instead.");
  }

  return publicStorageUrl(TEAM_PHOTOS_BUCKET, path);
}

// Best-effort cleanup of a replaced/removed photo — only deletes if the URL
// actually points into our bucket (an admin may have pasted an external
// URL instead of uploading), and never throws: a failed cleanup must never
// fail an already-saved TeamMember row.
export async function deleteTeamPhotoIfOwned(previousUrl: string | null | undefined): Promise<void> {
  const path = pathFromPublicUrl(TEAM_PHOTOS_BUCKET, previousUrl);
  if (path) await removeObjects(TEAM_PHOTOS_BUCKET, [path]);
}
