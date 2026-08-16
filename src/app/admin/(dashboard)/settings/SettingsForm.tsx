"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import { updateSettings, type SettingsFormState } from "./actions";
import { KNOWN_SETTING_KEYS } from "./keys";

const initialState: SettingsFormState = { status: "idle" };

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [state, formAction] = useActionState(updateSettings, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {KNOWN_SETTING_KEYS.map(({ key, label, hint }) => (
        <Field key={key} label={label} name={key} hint={hint}>
          <input id={key} name={key} type="text" defaultValue={values[key] ?? ""} className={inputClasses} />
        </Field>
      ))}

      <FormMessage status={state.status === "error" ? "error" : "success"} message={state.message} />

      <div>
        <SubmitButton label="Save settings" />
      </div>
    </form>
  );
}
