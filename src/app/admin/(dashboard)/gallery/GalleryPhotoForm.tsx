"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import type { GalleryPhotoFormState } from "./actions";

const initialState: GalleryPhotoFormState = { status: "idle" };

export function GalleryPhotoForm({
  action,
  photo,
}: {
  action: (prevState: GalleryPhotoFormState, formData: FormData) => Promise<GalleryPhotoFormState>;
  photo: { caption: string | null; showOnHomepage: boolean };
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <Field
        label="Caption (optional)"
        name="caption"
        errors={state.fieldErrors?.caption}
        hint="Shown under the photo and read out by screen readers — describe what's in it."
      >
        <textarea
          id="caption"
          name="caption"
          rows={2}
          maxLength={200}
          defaultValue={photo.caption ?? ""}
          className={inputClasses}
        />
      </Field>

      <label htmlFor="showOnHomepage" className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          id="showOnHomepage"
          name="showOnHomepage"
          type="checkbox"
          defaultChecked={photo.showOnHomepage}
          className="h-4 w-4 rounded border-border accent-murdoch-red"
        />
        Show on the homepage
      </label>

      <FormMessage status="error" message={state.status === "error" ? state.message : undefined} />

      <div>
        <SubmitButton label="Save changes" />
      </div>
    </form>
  );
}
