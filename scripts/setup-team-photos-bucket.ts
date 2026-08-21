// One-time setup: creates the public "team-photos" Storage bucket used for
// TeamMember profile photos (see src/lib/storage/upload-team-photo.ts).
// Public because these are already-public profile photos shown on the
// Team page — reads need no auth, so no storage.objects RLS policies are
// needed either (writes/deletes only ever happen server-side with the
// service-role key, which bypasses RLS entirely). Safe to re-run — an
// "already exists" error is treated as a no-op.
//
// Usage: npx tsx scripts/setup-team-photos-bucket.ts
import "dotenv/config";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import { TEAM_PHOTOS_BUCKET, TEAM_PHOTO_MAX_BYTES, TEAM_PHOTO_MIME_TYPES } from "../src/lib/storage/team-photos";

async function main() {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.createBucket(TEAM_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: TEAM_PHOTO_MAX_BYTES,
    allowedMimeTypes: [...TEAM_PHOTO_MIME_TYPES],
  });

  if (error) {
    if (error.message.toLowerCase().includes("already exists")) {
      console.log(`Bucket "${TEAM_PHOTOS_BUCKET}" already exists — nothing to do.`);
      return;
    }
    console.error("Failed to create bucket:", error.message);
    process.exitCode = 1;
    return;
  }
  console.log(`Created public bucket "${TEAM_PHOTOS_BUCKET}".`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
