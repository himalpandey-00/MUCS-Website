import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "../../ArticleForm";
import { updateArticle } from "../../actions";

export const metadata: Metadata = { title: "Edit article · Admin" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">Edit article</h1>
      <ArticleForm action={updateArticle.bind(null, id)} article={article} submitLabel="Save changes" />
    </div>
  );
}
