"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClasses } from "@/components/admin/form";
import type { ArticleFormState } from "./actions";

const initialState: ArticleFormState = { status: "idle" };

type ArticleFormValues = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  authorName: string | null;
  status: string;
};

export function ArticleForm({
  action,
  article,
  submitLabel,
}: {
  action: (prevState: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  article?: ArticleFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" name="title" errors={state.fieldErrors?.title}>
          <input id="title" name="title" type="text" required defaultValue={article?.title} className={inputClasses} />
        </Field>
        <Field
          label="Slug"
          name="slug"
          errors={state.fieldErrors?.slug}
          hint="Lowercase letters, numbers, hyphens — used in the URL."
        >
          <input id="slug" name="slug" type="text" required defaultValue={article?.slug} className={inputClasses} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Author (optional)" name="authorName" errors={state.fieldErrors?.authorName}>
          <input
            id="authorName"
            name="authorName"
            type="text"
            defaultValue={article?.authorName ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Status" name="status" errors={state.fieldErrors?.status}>
          <select id="status" name="status" defaultValue={article?.status ?? "DRAFT"} className={inputClasses}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </Field>
      </div>

      <Field label="Excerpt" name="excerpt" errors={state.fieldErrors?.excerpt} hint="Short — shown on cards and lists.">
        <textarea id="excerpt" name="excerpt" required rows={2} defaultValue={article?.excerpt} className={inputClasses} />
      </Field>

      <Field label="Body" name="body" errors={state.fieldErrors?.body} hint="Full article — plain text/paragraphs.">
        <textarea id="body" name="body" required rows={10} defaultValue={article?.body} className={inputClasses} />
      </Field>

      <Field label="Cover image URL (optional)" name="coverImageUrl" errors={state.fieldErrors?.coverImageUrl}>
        <input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          defaultValue={article?.coverImageUrl ?? ""}
          className={inputClasses}
        />
      </Field>

      <FormMessage status="error" message={state.status === "error" ? state.message : undefined} />

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
