"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import type { EventFormState } from "./actions";

const initialState: EventFormState = { status: "idle" };

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time.
function toDatetimeLocal(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type EventFormValues = {
  slug: string;
  title: string;
  category: string | null;
  summary: string;
  description: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  coverImageUrl: string | null;
  status: string;
};

export function EventForm({
  action,
  event,
  submitLabel,
}: {
  action: (prevState: EventFormState, formData: FormData) => Promise<EventFormState>;
  event?: EventFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" name="title" errors={state.fieldErrors?.title}>
          <input id="title" name="title" type="text" required defaultValue={event?.title} className={inputClasses} />
        </Field>
        <Field
          label="Slug"
          name="slug"
          errors={state.fieldErrors?.slug}
          hint="Lowercase letters, numbers, hyphens — used in the URL."
        >
          <input id="slug" name="slug" type="text" required defaultValue={event?.slug} className={inputClasses} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" name="category" errors={state.fieldErrors?.category} hint="e.g. Workshop, CTF, Talk">
          <input id="category" name="category" type="text" defaultValue={event?.category ?? ""} className={inputClasses} />
        </Field>
        <Field label="Status" name="status" errors={state.fieldErrors?.status}>
          <select id="status" name="status" defaultValue={event?.status ?? "DRAFT"} className={inputClasses}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Summary" name="summary" errors={state.fieldErrors?.summary} hint="Short — shown on cards and lists.">
        <textarea id="summary" name="summary" required rows={2} defaultValue={event?.summary} className={inputClasses} />
      </Field>

      <Field label="Description" name="description" errors={state.fieldErrors?.description} hint="Full detail page body.">
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          defaultValue={event?.description}
          className={inputClasses}
        />
      </Field>

      <Field label="Location" name="location" errors={state.fieldErrors?.location}>
        <input id="location" name="location" type="text" defaultValue={event?.location ?? ""} className={inputClasses} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starts at" name="startsAt" errors={state.fieldErrors?.startsAt}>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(event?.startsAt)}
            className={inputClasses}
          />
        </Field>
        <Field label="Ends at (optional)" name="endsAt" errors={state.fieldErrors?.endsAt}>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(event?.endsAt)}
            className={inputClasses}
          />
        </Field>
      </div>

      <Field label="Cover image URL (optional)" name="coverImageUrl" errors={state.fieldErrors?.coverImageUrl}>
        <input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          defaultValue={event?.coverImageUrl ?? ""}
          className={inputClasses}
        />
      </Field>

      <FormMessage status="error" message={state.status === "error" ? state.message : undefined} />

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
