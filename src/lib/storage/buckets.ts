// Public Supabase Storage buckets and their public URLs. Deliberately no
// "server-only": these are plain strings (only the public project URL is
// used, never a key), so client components can build image URLs too. The
// privileged upload/delete calls live in ./objects.ts (server-only).
//
// Buckets are created/configured by scripts/setup-storage-buckets.ts — both
// only accept the processed WebP files src/lib/images/process-image.ts
// produces, never raw uploads.
export const TEAM_PHOTOS_BUCKET = "team-photos";
export const GALLERY_BUCKET = "gallery";

/** Public CDN URL of an object in one of the public buckets above. */
export function publicStorageUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

/**
 * The object path inside `bucket` if `url` is one of our own public URLs for
 * it, else null — used to clean up a replaced photo without ever touching
 * an external URL someone pasted instead of uploading.
 */
export function pathFromPublicUrl(bucket: string, url: string | null | undefined): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url?.indexOf(marker) ?? -1;
  if (index === -1) return null;
  const path = decodeURIComponent(url!.slice(index + marker.length));
  return path || null;
}
