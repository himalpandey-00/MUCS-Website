"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

const articleSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(150)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1, "Title is required.").max(200),
  excerpt: z.string().trim().min(1, "Excerpt is required.").max(300),
  body: z.string().trim().min(1, "Body is required."),
  coverImageUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  authorName: z.string().trim().max(120).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type ArticleFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof articleSchema>, string[]>>;
};

function parseArticleForm(formData: FormData) {
  return articleSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    coverImageUrl: formData.get("coverImageUrl") || "",
    authorName: formData.get("authorName") || undefined,
    status: formData.get("status"),
  });
}

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<string | null> {
  const existing = await prisma.newsArticle.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) return "That slug is already in use — pick another.";
  return null;
}

export async function createArticle(_prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();

  const parsed = parseArticleForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const slugError = await assertSlugAvailable(data.slug);
  if (slugError) {
    return { status: "error", message: slugError, fieldErrors: { slug: [slugError] } };
  }

  try {
    await prisma.newsArticle.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        coverImageUrl: data.coverImageUrl || null,
        authorName: data.authorName || null,
        status: data.status,
        // First time it's published — see updateArticle for the "don't
        // clobber an existing publishedAt" version of this.
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("Failed to create article:", error);
    return { status: "error", message: "Something went wrong saving the article." };
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function updateArticle(id: string, _prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();

  const parsed = parseArticleForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const slugError = await assertSlugAvailable(data.slug, id);
  if (slugError) {
    return { status: "error", message: slugError, fieldErrors: { slug: [slugError] } };
  }

  const existing = await prisma.newsArticle.findUnique({ where: { id }, select: { publishedAt: true } });

  try {
    await prisma.newsArticle.update({
      where: { id },
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        coverImageUrl: data.coverImageUrl || null,
        authorName: data.authorName || null,
        status: data.status,
        // Set publishedAt the first time it goes live; don't reset it on
        // later edits, and don't clear it if temporarily unpublished.
        publishedAt: data.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to update article:", error);
    return { status: "error", message: "Something went wrong saving the article." };
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath(`/news/${data.slug}`);
  redirect("/admin/news");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const article = await prisma.newsArticle.delete({ where: { id } });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath(`/news/${article.slug}`);
  redirect("/admin/news");
}
