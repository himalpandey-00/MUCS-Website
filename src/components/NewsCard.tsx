import Link from "next/link";
import type { NewsArticle } from "@/generated/prisma/client";

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Australia/Perth",
});

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 transition-colors hover:border-murdoch-red/60"
    >
      {article.publishedAt && (
        <span className="font-mono text-[11px] text-foreground-muted">
          {dateFormatter.format(article.publishedAt)}
        </span>
      )}
      <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-murdoch-red">
        {article.title}
      </h3>
      <p className="text-sm text-foreground-muted">{article.excerpt}</p>
      {article.authorName && <p className="mt-auto text-xs text-muted">{article.authorName}</p>}
    </Link>
  );
}
