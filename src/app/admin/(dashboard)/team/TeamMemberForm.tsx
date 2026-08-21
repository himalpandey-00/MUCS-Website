"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import { PhotoField } from "./PhotoField";
import type { TeamMemberFormState } from "./actions";

const initialState: TeamMemberFormState = { status: "idle" };

type TeamMemberFormValues = {
  name: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  isPresident: boolean;
};

export function TeamMemberForm({
  action,
  member,
  submitLabel,
}: {
  action: (prevState: TeamMemberFormState, formData: FormData) => Promise<TeamMemberFormState>;
  member?: TeamMemberFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" errors={state.fieldErrors?.name}>
          <input id="name" name="name" type="text" required defaultValue={member?.name} className={inputClasses} />
        </Field>
        <Field label="Position" name="position" errors={state.fieldErrors?.position} hint="e.g. President, CTF Lead">
          <input id="position" name="position" type="text" required defaultValue={member?.position} className={inputClasses} />
        </Field>
      </div>

      <Field label="Bio (optional)" name="bio" errors={state.fieldErrors?.bio}>
        <textarea id="bio" name="bio" rows={4} defaultValue={member?.bio ?? ""} className={inputClasses} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <PhotoField currentPhotoUrl={member?.photoUrl} />
          {state.fieldErrors?.photoUrl?.map((error) => (
            <p key={error} role="alert" className="text-sm text-coral">
              {error}
            </p>
          ))}
          <p className="text-xs text-foreground-muted">Left blank, initials are shown instead.</p>
        </div>
        <Field
          label="Email (optional)"
          name="email"
          errors={state.fieldErrors?.email}
          hint="If set, they'll be invited to sign in at /admin."
        >
          <input id="email" name="email" type="email" defaultValue={member?.email ?? ""} className={inputClasses} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="LinkedIn URL (optional)" name="linkedinUrl" errors={state.fieldErrors?.linkedinUrl}>
          <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={member?.linkedinUrl ?? ""} className={inputClasses} />
        </Field>
        <Field label="GitHub URL (optional)" name="githubUrl" errors={state.fieldErrors?.githubUrl}>
          <input id="githubUrl" name="githubUrl" type="url" defaultValue={member?.githubUrl ?? ""} className={inputClasses} />
        </Field>
        <Field label="Website URL (optional)" name="websiteUrl" errors={state.fieldErrors?.websiteUrl}>
          <input id="websiteUrl" name="websiteUrl" type="url" defaultValue={member?.websiteUrl ?? ""} className={inputClasses} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Display order"
          name="displayOrder"
          errors={state.fieldErrors?.displayOrder}
          hint="Lower numbers show first."
        >
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            defaultValue={member?.displayOrder ?? 0}
            className={inputClasses}
          />
        </Field>
        <div className="flex items-end pb-2.5">
          <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={member?.isActive ?? true}
              className="h-4 w-4 rounded border-border accent-murdoch-red"
            />
            Active — shown on the public Team page
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="isPresident" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            id="isPresident"
            name="isPresident"
            type="checkbox"
            defaultChecked={member?.isPresident ?? false}
            className="h-4 w-4 rounded border-border accent-murdoch-red"
          />
          Club President
        </label>
        <p className="text-xs text-foreground-muted">
          Only one member can be president — checking this unchecks anyone else.
        </p>
      </div>

      <FormMessage status="error" message={state.status === "error" ? state.message : undefined} />

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
