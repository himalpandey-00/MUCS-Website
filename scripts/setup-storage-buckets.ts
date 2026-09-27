// Creates or updates the public Storage buckets the site uses (see
// src/lib/storage/buckets.ts). Both are public-read (these photos are shown
// on the public site anyway), so no storage.objects RLS policies are
// needed: writes/deletes only ever happen server-side with the service-role
// key, which bypasses RLS. Each bucket only accepts the processed WebP files
// src/lib/images/process-image.ts produces — never raw uploads.
//
// Safe to re-run: existing buckets are updated to the config below.
//
// Usage: npx tsx scripts/setup-storage-buckets.ts            (all buckets)
//        npx tsx scripts/setup-storage-buckets.ts gallery    (just one)
import "dotenv/config";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import { GALLERY_BUCKET, TEAM_PHOTOS_BUCKET } from "../src/lib/storage/buckets";
import { STORED_IMAGE_MAX_BYTES } from "../src/lib/images/limits";

const BUCKET_OPTIONS = {
  public: true,
  fileSizeLimit: STORED_IMAGE_MAX_BYTES,
  allowedMimeTypes: ["image/webp"],
};

const BUCKETS = [GALLERY_BUCKET, TEAM_PHOTOS_BUCKET];

async function main() {
  const requested = process.argv.slice(2);
  const unknown = requested.filter((name) => !BUCKETS.includes(name));
  if (unknown.length > 0) {
    console.error(`Unknown bucket(s): ${unknown.join(", ")}. Known: ${BUCKETS.join(", ")}.`);
    process.exitCode = 1;
    return;
  }

  const supabase = createSupabaseAdminClient();
  for (const bucket of requested.length > 0 ? requested : BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(bucket);
    const { error } = existing
      ? await supabase.storage.updateBucket(bucket, BUCKET_OPTIONS)
      : await supabase.storage.createBucket(bucket, BUCKET_OPTIONS);

    if (error) {
      console.error(`Failed to ${existing ? "update" : "create"} bucket "${bucket}":`, error.message);
      process.exitCode = 1;
      continue;
    }
    console.log(`${existing ? "Updated" : "Created"} public bucket "${bucket}" (WebP only, max 2 MB per file).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
