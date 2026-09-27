import { MAX_SOURCE_BYTES, MAX_UPLOAD_BYTES, UPLOAD_LONG_EDGE } from "./limits";

// Browser-only (uses canvas / createImageBitmap): shrinks a photo before it
// is uploaded, so a 12 MB phone photo goes over the wire as a ~1 MB JPEG.
// That keeps every upload far below Vercel's 4.5 MB request cap and makes
// uploads fast on campus Wi-Fi. JPEG rather than WebP because Safari's
// canvas can't encode WebP. The server still re-validates and re-encodes
// everything (src/lib/images/process-image.ts) — this step is for size and
// speed, not security.

export class ImagePrepError extends Error {}

function isHeic(file: File) {
  return /\.(heic|heif)$/i.test(file.name) || /image\/hei[cf]/i.test(file.type);
}

function withJpegExtension(name: string) {
  const base = name.replace(/\.[^./\\]+$/, "") || "photo";
  return `${base}.jpg`;
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ImagePrepError("That file is over 40 MB — pick a smaller photo.");
  }
  if (file.type && !file.type.startsWith("image/")) {
    throw new ImagePrepError("That file isn't an image.");
  }

  let bitmap: ImageBitmap;
  try {
    // Applies the photo's EXIF rotation, so portrait phone shots stay upright.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImagePrepError(
      isHeic(file)
        ? "This browser can't read HEIC photos. Export it as JPEG first (uploading straight from an iPhone converts it automatically)."
        : "Couldn't read that image. Try a JPEG or PNG."
    );
  }

  try {
    const scale = Math.min(1, UPLOAD_LONG_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new ImagePrepError("Couldn't process that image in this browser.");

    // JPEG has no transparency — give transparent PNGs a white background
    // instead of black.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new ImagePrepError("Couldn't process that image in this browser.");
    if (blob.size > MAX_UPLOAD_BYTES) throw new ImagePrepError("That photo is still too large after resizing.");

    return new File([blob], withJpegExtension(file.name), { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
