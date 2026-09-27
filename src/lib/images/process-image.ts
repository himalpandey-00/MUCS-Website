import "server-only";
import sharp from "sharp";
import { MAX_UPLOAD_BYTES, STORED_IMAGE_MAX_BYTES } from "./limits";

// Server-side image processing for every photo upload (gallery and team
// photos). Never trusts what the browser says a file is: sharp has to
// actually decode it. Output is always freshly encoded WebP with ALL
// metadata dropped — sharp strips EXIF by default, which removes things
// like a phone's GPS location from photos taken at someone's home.

export class ImageProcessingError extends Error {}

// Decodable formats we accept. Notably not SVG (a document format, not a
// photo) and not HEIC (sharp's prebuilt binaries can't decode it; the
// browser-side prep step explains how to convert).
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif"]);

// Guards against "decompression bomb" files that are small on disk but
// enormous when decoded. 50 MP comfortably covers any phone camera.
const MAX_INPUT_PIXELS = 50_000_000;

export type ImageVariantSpec = { name: string; longEdge: number; quality?: number };
export type ProcessedImage = { name: string; buffer: Buffer; width: number; height: number };

export async function processImage(file: File, variants: ImageVariantSpec[]): Promise<ProcessedImage[]> {
  if (file.size === 0) throw new ImageProcessingError("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new ImageProcessingError("That photo is too large (max 4 MB per upload).");

  const input = Buffer.from(await file.arrayBuffer());
  const open = () => sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" });

  let format: string | undefined;
  try {
    format = (await open().metadata()).format;
  } catch {
    throw new ImageProcessingError("That file isn't a readable image.");
  }
  if (!format || !ACCEPTED_FORMATS.has(format)) {
    throw new ImageProcessingError("Photos must be JPEG, PNG, WebP, AVIF or GIF.");
  }

  try {
    return await Promise.all(
      variants.map(async ({ name, longEdge, quality = 80 }) => {
        const { data, info } = await open()
          .rotate() // apply EXIF orientation before the metadata is dropped
          .resize({ width: longEdge, height: longEdge, fit: "inside", withoutEnlargement: true })
          .webp({ quality })
          .toBuffer({ resolveWithObject: true });
        if (data.length > STORED_IMAGE_MAX_BYTES) {
          throw new ImageProcessingError("That photo is too detailed to store — try a smaller one.");
        }
        return { name, buffer: data, width: info.width, height: info.height };
      })
    );
  } catch (error) {
    if (error instanceof ImageProcessingError) throw error;
    console.error("Image processing failed:", error);
    throw new ImageProcessingError("Couldn't process that image. Try a different photo.");
  }
}
