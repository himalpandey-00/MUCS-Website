"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestMagicLink, type LoginFormState } from "./actions";

const initialState: LoginFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-murdoch-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-deep-red disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send sign-in link"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(requestMagicLink, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="w-full rounded-md border border-border bg-surface-raised px-4 py-2.5 text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-murdoch-red"
        />
      </div>

      {state.status === "success" && (
        <p role="status" className="rounded-md border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
          {state.message}
        </p>
      )}
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-md border border-murdoch-red/40 bg-accent-soft px-4 py-3 text-sm text-coral">
          {state.message}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
