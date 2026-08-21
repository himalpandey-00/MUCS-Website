"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/admin/form";
import { stepDownFromAdmin, type StepDownState } from "./actions";

const initialState: StepDownState = { status: "idle" };

export function StepDownForm() {
  const [state, formAction] = useActionState(stepDownFromAdmin, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        if (!confirm("Step down from Admin? You'll drop to Staff immediately — make sure someone else has Admin first.")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="inline-flex w-fit items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:border-murdoch-red/40 hover:text-murdoch-red"
      >
        Step down to Staff
      </button>
      <FormMessage status="error" message={state.status === "error" ? state.message : undefined} />
    </form>
  );
}
