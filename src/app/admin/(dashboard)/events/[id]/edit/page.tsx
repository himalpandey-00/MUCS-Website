import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventForm } from "../../EventForm";
import { updateEvent } from "../../actions";

export const metadata: Metadata = { title: "Edit event · Admin" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">Edit event</h1>
      <EventForm action={updateEvent.bind(null, id)} event={event} submitLabel="Save changes" />
    </div>
  );
}
