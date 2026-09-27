import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { DeleteButton } from "@/components/admin/form";
import { formatShortDate } from "@/lib/format";
import { HOMEPAGE_GALLERY_LIMIT, HOMEPAGE_GALLERY_MIN, toPublicGalleryPhoto } from "@/lib/gallery";
import { GalleryUploader } from "./GalleryUploader";
import { deleteGalleryPhoto, setGalleryPhotoOnHomepage } from "./actions";

export const metadata: Metadata = { title: "Gallery · Admin" };

export default async function AdminGalleryPage() {
  await requireAdmin();
  const rows = await prisma.galleryPhoto.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caption: true,
      imagePath: true,
      thumbPath: true,
      width: true,
      height: true,
      showOnHomepage: true,
      createdAt: true,
      uploadedBy: { select: { name: true, email: true } },
    },
  });

  const onHomepage = rows.filter((row) => row.showOnHomepage).length;
  const stillNeeded = Math.max(0, HOMEPAGE_GALLERY_MIN - onHomepage);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-extrabold">Gallery</h1>
        <p className="max-w-2xl text-sm text-foreground-muted">
          Every photo here appears on the public{" "}
          <Link href="/gallery" className="text-teal hover:text-foreground">
            Gallery page
          </Link>
          . Photos marked &ldquo;On homepage&rdquo; also scroll across the homepage (the newest {HOMEPAGE_GALLERY_LIMIT}).
        </p>
        <p className="text-sm font-medium text-foreground">
          {onHomepage} of {rows.length} photo{rows.length === 1 ? "" : "s"} on the homepage.
          {stillNeeded > 0 && (
            <span className="font-normal text-foreground-muted">
              {" "}
              The homepage band appears once {HOMEPAGE_GALLERY_MIN} are — add or show {stillNeeded} more.
            </span>
          )}
        </p>
      </div>

      <GalleryUploader />

      {rows.length === 0 ? (
        <p className="text-sm text-foreground-muted">No photos yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const photo = toPublicGalleryPhoto(row);
            const uploader = row.uploadedBy?.name || row.uploadedBy?.email || "a former staff member";
            return (
              <li key={row.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative aspect-[4/3] w-full bg-surface-raised">
                  <Image src={photo.thumbSrc} alt={photo.alt} fill unoptimized className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex flex-col gap-1">
                    <p className={`text-sm ${photo.caption ? "text-foreground" : "italic text-foreground-muted"}`}>
                      {photo.caption ?? "No caption"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Uploaded by {uploader} · {formatShortDate(row.createdAt)}
                    </p>
                    <p className={`text-xs font-medium ${row.showOnHomepage ? "text-teal" : "text-foreground-muted"}`}>
                      {row.showOnHomepage ? "On homepage" : "Gallery page only"}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Link
                      href={`/admin/gallery/${row.id}/edit`}
                      className="text-sm font-medium text-teal hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <form action={setGalleryPhotoOnHomepage.bind(null, row.id, !row.showOnHomepage)}>
                      <button type="submit" className="text-sm font-medium text-foreground-muted hover:text-foreground">
                        {row.showOnHomepage ? "Hide from homepage" : "Show on homepage"}
                      </button>
                    </form>
                    <form action={deleteGalleryPhoto.bind(null, row.id)}>
                      <DeleteButton confirmMessage="Delete this photo from the gallery? This can't be undone." />
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
