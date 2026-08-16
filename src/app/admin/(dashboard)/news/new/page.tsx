import type { Metadata } from "next";
import { ArticleForm } from "../ArticleForm";
import { createArticle } from "../actions";

export const metadata: Metadata = { title: "New article · Admin" };

export default function NewArticlePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">New article</h1>
      <ArticleForm action={createArticle} submitLabel="Create article" />
    </div>
  );
}
