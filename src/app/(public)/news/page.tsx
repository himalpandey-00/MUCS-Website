import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/NewsCard";
import { getPublishedArticles } from "@/lib/data";

export const metadata: Metadata = {
  title: "News",
  description: "Updates, recaps, and announcements from the Murdoch Cyber Security Club.",
};

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <section>
      <Container className="flex flex-col gap-10 py-20">
        <SectionHeading title="From the club" />
        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-foreground-muted">No news yet — check back soon.</p>
        )}
      </Container>
    </section>
  );
}
