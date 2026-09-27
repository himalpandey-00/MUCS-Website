import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Privileged writes to the public buckets (src/lib/storage/buckets.ts) via
// the service-role client, which bypasses Storage RLS — so these must only
// ever run server-side, behind requireAdmin() in the calling action.

export type StorageObject = { path: string; body: Buffer; contentType: string };

// How long browsers and Supabase's CDN may keep serving a file. Deliberately
// short: on Supabase's free plan the CDN is NOT purged when a file is
// deleted (that's the Pro plan's "Smart CDN"), so a long lifetime would let
// a deleted photo keep loading for anyone who has its link. With one hour,
// deleting a photo (e.g. at someone's request) takes full effect within the
// hour, while repeat views still come from cache.
const CACHE_SECONDS = "3600";

/** Uploads all objects, or none: if any upload fails, the ones that succeeded are removed again. */
export async function uploadObjects(bucket: string, objects: StorageObject[]): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const uploaded: string[] = [];
  try {
    for (const object of objects) {
      const { error } = await supabase.storage.from(bucket).upload(object.path, object.body, {
        contentType: object.contentType,
        cacheControl: CACHE_SECONDS,
        upsert: false,
      });
      if (error) throw new Error(`upload ${bucket}/${object.path}: ${error.message}`);
      uploaded.push(object.path);
    }
  } catch (error) {
    await removeObjects(bucket, uploaded);
    throw error;
  }
}

/** Best-effort delete. Never throws: a failed cleanup must not fail an already-saved change. */
export async function removeObjects(bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) console.warn(`Failed to delete ${bucket}/${paths.join(", ")}:`, error.message);
  } catch (error) {
    console.warn(`Failed to delete ${bucket}/${paths.join(", ")}:`, error);
  }
}
