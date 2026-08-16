"use client";

import { useActionState, useRef, useEffect, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle" };

const inputClasses =
  "w-full rounded-md border border-border bg-surface-raised px-4 py-2.5 text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-murdoch-red";

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  children: ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {errors?.map((error) => (
        <p key={error} id={errorId} role="alert" className="text-sm text-coral">
          {error}
        </p>
      ))}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-murdoch-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-deep-red disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-5">
      {/* Honeypot — hidden from sighted/keyboard users, bots often fill every field */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="Name" name="name" errors={state.fieldErrors?.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          className={inputClasses}
        />
      </Field>

      <Field label="Email" name="email" errors={state.fieldErrors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          className={inputClasses}
        />
      </Field>

      <Field label="Subject (optional)" name="subject" errors={state.fieldErrors?.subject}>
        <input id="subject" name="subject" type="text" className={inputClasses} />
      </Field>

      <Field label="Message" name="message" errors={state.fieldErrors?.message}>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          aria-invalid={state.fieldErrors?.message ? true : undefined}
          className={inputClasses}
        />
      </Field>

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
