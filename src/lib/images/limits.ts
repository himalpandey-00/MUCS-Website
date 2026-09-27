// Size limits shared by the browser-side prep (./prepare-upload.ts) and the
// server-side processing (./process-image.ts). Plain constants, safe on
// both sides.

/** Largest original file a staff member can pick (before in-browser resizing). */
export const MAX_SOURCE_BYTES = 40 * 1024 * 1024;

/**
 * Largest file the server accepts per request. Photos are downscaled in the
 * browser first (to ~1 MB), so this only bites if that step was skipped —
 * and it stays under Vercel's 4.5 MB function request-body cap, which
 * would otherwise reject the request before our code even runs.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Long edge the browser downscales to before uploading. */
export const UPLOAD_LONG_EDGE = 2048;

/** Per-object cap for the processed WebP files stored in Storage. */
export const STORED_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
