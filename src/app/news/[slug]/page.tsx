import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getArticleBySlug } from "@/lib/data";

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Australia/Perth",
});

export async function generateMetadata({
  params,
}: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function NewsDetailPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <Container className="flex flex-col gap-8 py-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{article.title}</h1>
        <p className="font-mono text-sm text-foreground-muted">
          {article.publishedAt && dateFormatter.format(article.publishedAt)}
          {article.authorName && ` · ${article.authorName}`}
        </p>
      </div>

      <div className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-foreground-muted">
        {article.body}
      </div>

      <div className="pt-4">
        <ButtonLink href="/news" variant="secondary">
          ← Back to news
        </ButtonLink>
      </div>
    </Container>
  );
}
