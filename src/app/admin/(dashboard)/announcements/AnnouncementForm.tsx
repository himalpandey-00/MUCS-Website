"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import type { AnnouncementFormState } from "./actions";

const initialState: AnnouncementFormState = { status: "idle" };

function toDatetimeLocal(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type AnnouncementFormValues = {
  title: string;
  body: string;
  isPinned: boolean;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export function AnnouncementForm({
  action,
  announcement,
  submitLabel,
}: {
  action: (prevState: AnnouncementFormState, formData: FormData) => Promise<AnnouncementFormState>;
  announcement?: AnnouncementFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <Field label="Title" name="title" errors={state.fieldErrors?.title}>
        <input id="title" name="title" type="text" required defaultValue={announcement?.title} className={inputClasses} />
      </Field>

      <Field label="Body" name="body" errors={state.fieldErrors?.body}>
        <textarea id="body" name="body" required rows={3} defaultValue={announcement?.body} className={inputClasses} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Starts at (optional)"
          name="startsAt"
          errors={state.fieldErrors?.startsAt}
          hint="Leave blank to show immediately."
        >
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(announcement?.startsAt)}
            className={inputClasses}
          />
        </Field>
        <Field
          label="Ends at (optional)"
          name="endsAt"
          errors={state.fieldErrors?.endsAt}
          hint="Leave blank to show indefinitely."
        >
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(announcement?.endsAt)}
            className={inputClasses}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label htmlFor="isPinned" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            id="isPinned"
            name="isPinned"
            type="checkbox"
            defaultChecked={announcement?.isPinned ?? false}
            className="h-4 w-4 rounded border-border accent-murdoch-red"
          />
          Pinned — shown above other announcements
        </label>
        <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={announcement?.isActive ?? true}
            className="h-4 w-4 rounded border-border accent-murdoch-red"
          />
          Active — visible on the site
        </label>
      </div>

      <FormMessage status="error" message={state.status === "error" ? state.message : undefined} />

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
