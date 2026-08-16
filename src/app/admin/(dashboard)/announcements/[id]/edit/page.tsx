import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnnouncementForm } from "../../AnnouncementForm";
import { updateAnnouncement } from "../../actions";

export const metadata: Metadata = { title: "Edit announcement · Admin" };

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">Edit announcement</h1>
      <AnnouncementForm action={updateAnnouncement.bind(null, id)} announcement={announcement} submitLabel="Save changes" />
    </div>
  );
}
