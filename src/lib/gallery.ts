import { GALLERY_BUCKET, publicStorageUrl } from "@/lib/storage/buckets";

// Shared gallery rules and helpers, used by the public pages (src/lib/
// data.ts, /gallery, the homepage band) and the admin gallery.

/** The homepage photo band only appears once at least this many photos are marked "Show on homepage"… */
export const HOMEPAGE_GALLERY_MIN = 6;
/** …and shows the newest this-many of them. */
export const HOMEPAGE_GALLERY_LIMIT = 16;
/** Photos per page on /gallery. */
export const GALLERY_PAGE_SIZE = 24;

const DEFAULT_ALT = "Photo from a MUCS club event";

/** A gallery photo as the public pages need it: ready-to-use URLs, no storage internals. */
export type PublicGalleryPhoto = {
  id: string;
  src: string;
  thumbSrc: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
};

export function toPublicGalleryPhoto(photo: {
  id: string;
  caption: string | null;
  imagePath: string;
  thumbPath: string;
  width: number;
  height: number;
}): PublicGalleryPhoto {
  return {
    id: photo.id,
    src: publicStorageUrl(GALLERY_BUCKET, photo.imagePath),
    thumbSrc: publicStorageUrl(GALLERY_BUCKET, photo.thumbPath),
    alt: photo.caption?.trim() || DEFAULT_ALT,
    caption: photo.caption?.trim() || null,
    width: photo.width,
    height: photo.height,
  };
}

/** Fields to select from GalleryPhoto for toPublicGalleryPhoto(). */
export const PUBLIC_GALLERY_PHOTO_SELECT = {
  id: true,
  caption: true,
  imagePath: true,
  thumbPath: true,
  width: true,
  height: true,
} as const;
