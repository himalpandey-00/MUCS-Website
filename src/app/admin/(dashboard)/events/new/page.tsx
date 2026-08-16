import type { Metadata } from "next";
import { EventForm } from "../EventForm";
import { createEvent } from "../actions";

export const metadata: Metadata = { title: "New event · Admin" };

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">New event</h1>
      <EventForm action={createEvent} submitLabel="Create event" />
    </div>
  );
}
