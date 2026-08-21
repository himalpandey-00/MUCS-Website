import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { TEAM_PHOTOS_BUCKET, TEAM_PHOTO_MAX_BYTES, isAllowedTeamPhotoType } from "./team-photos";

// Thrown for validation/upload failures that should surface as a form
// error (see src/app/admin/(dashboard)/team/actions.ts) rather than a
// generic 500.
export class TeamPhotoUploadError extends Error {}

// Validates type/size server-side (never trust the client) and uploads to
// the public team-photos bucket via the service-role client — no
// storage.objects RLS policies are needed since writes only ever happen
// here, server-side, with the service role (which bypasses RLS entirely).
// Returns the public CDN URL to store on TeamMember.photoUrl.
export async function uploadTeamPhoto(file: File): Promise<string> {
  if (!isAllowedTeamPhotoType(file.type)) {
    throw new TeamPhotoUploadError("Photo must be a PNG, JPEG, WebP, or GIF.");
  }
  if (file.size > TEAM_PHOTO_MAX_BYTES) {
    throw new TeamPhotoUploadError("Photo must be 5MB or smaller.");
  }

  const supabase = createSupabaseAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(TEAM_PHOTOS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("Team photo upload failed:", error.message);
    throw new TeamPhotoUploadError("Upload failed. Try again, or paste an image URL instead.");
  }

  return supabase.storage.from(TEAM_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Best-effort cleanup of a replaced/removed photo — only deletes if the URL
// actually points into our bucket (an admin may have pasted an external
// URL instead of uploading), and never throws: a failed cleanup must never
// fail an already-saved TeamMember row.
export async function deleteTeamPhotoIfOwned(previousUrl: string | null | undefined): Promise<void> {
  const marker = `/storage/v1/object/public/${TEAM_PHOTOS_BUCKET}/`;
  const index = previousUrl?.indexOf(marker) ?? -1;
  if (index === -1) return;
  const path = previousUrl!.slice(index + marker.length);
  if (!path) return;

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(TEAM_PHOTOS_BUCKET).remove([path]);
    if (error) console.warn(`Failed to delete old team photo "${path}":`, error.message);
  } catch (error) {
    console.warn(`Failed to delete old team photo "${path}":`, error);
  }
}
