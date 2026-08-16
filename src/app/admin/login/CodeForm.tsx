"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import { verifyLoginCode, type CodeFormState } from "./actions";

const initialState: CodeFormState = { status: "idle" };

export function CodeForm() {
  const [state, formAction] = useActionState(verifyLoginCode, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {/* Field's `name` prop only drives the <label htmlFor>/id pairing —
          namespaced here so it doesn't collide with the "email" id already
          used by LoginForm on this same page. The actual submitted field
          names (read via formData.get) are set on the <input> itself. */}
      <Field label="Email" name="code-email">
        <input
          id="code-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClasses}
        />
      </Field>
      <Field label="Code" name="code-code">
        <input
          id="code-code"
          name="code"
          type="text"
          inputMode="numeric"
          required
          autoComplete="one-time-code"
          className={inputClasses}
        />
      </Field>

      <FormMessage status="error" message={state.status === "error" ? state.message : undefined} />

      <div>
        <SubmitButton label="Verify code" pendingLabel="Verifying…" />
      </div>
    </form>
  );
}
