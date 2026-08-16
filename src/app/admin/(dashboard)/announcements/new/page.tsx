import type { Metadata } from "next";
import { AnnouncementForm } from "../AnnouncementForm";
import { createAnnouncement } from "../actions";

export const metadata: Metadata = { title: "New announcement · Admin" };

export default function NewAnnouncementPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">New announcement</h1>
      <AnnouncementForm action={createAnnouncement} submitLabel="Create announcement" />
    </div>
  );
}
