"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export const inputClasses =
  "w-full rounded-md border border-border bg-charcoal px-4 py-2.5 text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-murdoch-red";

export function Field({
  label,
  name,
  errors,
  hint,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !errors?.length && <p className="text-xs text-foreground-muted">{hint}</p>}
      {errors?.map((error) => (
        <p key={error} role="alert" className="text-sm text-coral">
          {error}
        </p>
      ))}
    </div>
  );
}

export function SubmitButton({ label, pendingLabel = "Saving…" }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-murdoch-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-deep-red disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function FormMessage({ status, message }: { status: "success" | "error"; message?: string }) {
  if (!message) return null;
  if (status === "success") {
    return (
      <p role="status" className="rounded-md border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-cyan">
        {message}
      </p>
    );
  }
  return (
    <p role="alert" className="rounded-md border border-murdoch-red/40 bg-accent-soft px-4 py-3 text-sm text-coral">
      {message}
    </p>
  );
}

// Wrap in a <form action={deleteX.bind(null, id)}> — confirms, then lets
// the native form submission proceed straight to the Server Action.
export function DeleteButton({ confirmMessage = "Delete this? This can't be undone." }: { confirmMessage?: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!confirm(confirmMessage)) event.preventDefault();
      }}
      className="text-sm font-medium text-coral hover:text-murdoch-red"
    >
      Delete
    </button>
  );
}
