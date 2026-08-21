// Shared constants for team member profile photo uploads — deliberately no
// "server-only" guard, since the client-side dropzone (src/app/admin/
// (dashboard)/team/PhotoField.tsx) also imports these for instant
// client-side validation feedback. Nothing sensitive here; the actual
// upload/delete privileged calls live in ./upload-team-photo.ts.
export const TEAM_PHOTOS_BUCKET = "team-photos";

export const TEAM_PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB

export const TEAM_PHOTO_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

export function isAllowedTeamPhotoType(type: string): boolean {
  return (TEAM_PHOTO_MIME_TYPES as readonly string[]).includes(type);
}
