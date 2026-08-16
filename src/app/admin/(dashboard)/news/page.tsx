import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/form";
import { deleteArticle } from "./actions";

export const metadata: Metadata = { title: "News · Admin" };

export default async function AdminNewsPage() {
  const articles = await prisma.newsArticle.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">News</h1>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center justify-center rounded-md bg-murdoch-red px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-white hover:bg-deep-red"
        >
          New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-foreground-muted">No articles yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{article.title}</td>
                  <td className={`px-4 py-3 font-medium ${article.status === "PUBLISHED" ? "text-teal" : "text-foreground-muted"}`}>
                    {article.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/news/${article.id}/edit`} className="text-sm font-medium text-teal hover:text-foreground">
                        Edit
                      </Link>
                      <form action={deleteArticle.bind(null, article.id)}>
                        <DeleteButton confirmMessage={`Delete "${article.title}"? This can't be undone.`} />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
