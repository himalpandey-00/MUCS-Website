"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import { SOCIAL_PLATFORMS } from "@/lib/social";
import { updateSettings, type SettingsFormState } from "./actions";
import { KNOWN_SETTING_KEYS } from "./keys";

const initialState: SettingsFormState = { status: "idle" };

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [state, formAction] = useActionState(updateSettings, initialState);
  // After a failed save, keep what the admin typed rather than snapping
  // back to the saved values.
  const valueFor = (key: string) => state.values?.[key] ?? values[key] ?? "";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 font-heading text-lg font-bold">Contact &amp; meetings</legend>
        {KNOWN_SETTING_KEYS.map(({ key, label, hint }) => (
          <Field key={key} label={label} name={key} hint={hint} errors={state.fieldErrors?.[key]}>
            <input
              id={key}
              name={key}
              type={key === "contact_email" ? "email" : "text"}
              defaultValue={valueFor(key)}
              className={inputClasses}
            />
          </Field>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-1 font-heading text-lg font-bold">Social links</legend>
        <p className="text-sm text-foreground-muted">
          Paste the full link to each profile. Only the ones filled in show as icons in the footer and on the
          Contact page — leave the rest blank.
        </p>
        {SOCIAL_PLATFORMS.map((platform) => (
          <Field
            key={platform.key}
            label={platform.name}
            name={platform.key}
            hint={`e.g. ${platform.example}`}
            errors={state.fieldErrors?.[platform.key]}
          >
            <input
              id={platform.key}
              name={platform.key}
              type="url"
              inputMode="url"
              placeholder={platform.example}
              defaultValue={valueFor(platform.key)}
              className={inputClasses}
            />
          </Field>
        ))}
      </fieldset>

      <FormMessage status={state.status === "error" ? "error" : "success"} message={state.message} />

      <div>
        <SubmitButton label="Save settings" />
      </div>
    </form>
  );
}
