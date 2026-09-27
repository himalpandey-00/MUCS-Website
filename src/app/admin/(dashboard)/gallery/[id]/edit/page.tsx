import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { toPublicGalleryPhoto } from "@/lib/gallery";
import { GalleryPhotoForm } from "../../GalleryPhotoForm";
import { updateGalleryPhoto } from "../../actions";

export const metadata: Metadata = { title: "Edit photo · Admin" };

export default async function EditGalleryPhotoPage({ params }: PageProps<"/admin/gallery/[id]/edit">) {
  const { id } = await params;
  const [, row] = await Promise.all([requireAdmin(), prisma.galleryPhoto.findUnique({ where: { id } })]);
  if (!row) notFound();
  const photo = toPublicGalleryPhoto(row);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-extrabold">Edit photo</h1>
        <Link href="/admin/gallery" className="text-sm font-medium text-teal hover:text-foreground">
          ← Back to gallery
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          unoptimized
          className="h-auto max-h-[60vh] w-full object-contain"
        />
      </div>
      <GalleryPhotoForm action={updateGalleryPhoto.bind(null, id)} photo={row} />
    </div>
  );
}
