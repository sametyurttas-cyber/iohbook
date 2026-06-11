import { cache } from "react";
import { requireStaff } from "@/features/auth/queries";
import {
  fallbackContent,
  REQUIRED_CONTENT_SLUGS,
  type RequiredContentSlug
} from "@/features/content/fallbacks";
import type { ContentBody } from "@/features/content/content-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentPage, ContentPageStatus } from "@/types/database";

export type ContentPageView = Pick<
  ContentPage,
  | "body"
  | "created_at"
  | "excerpt"
  | "id"
  | "published_at"
  | "seo_description"
  | "seo_title"
  | "slug"
  | "status"
  | "title"
  | "updated_at"
>;

export type ResolvedContentPage = {
  body: ContentBody;
  excerpt: string | null;
  isFallback: boolean;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  status: ContentPageStatus;
  title: string;
};

function normalizeBody(body: Record<string, unknown> | null | undefined): ContentBody {
  const blocks = Array.isArray(body?.blocks) ? body.blocks : [];

  return {
    blocks: blocks as ContentBody["blocks"]
  };
}

export const getPublishedContentPage = cache(async function getPublishedContentPage(
  slug: RequiredContentSlug
): Promise<ResolvedContentPage> {
  const fallback = fallbackContent[slug];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_pages")
      .select("slug, title, status, excerpt, body, seo_title, seo_description, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      return {
        body: { blocks: fallback.blocks },
        excerpt: fallback.excerpt,
        isFallback: true,
        seoDescription: fallback.excerpt,
        seoTitle: fallback.title,
        slug,
        status: "published",
        title: fallback.title
      };
    }

    return {
      body: normalizeBody(data.body),
      excerpt: data.excerpt,
      isFallback: false,
      seoDescription: data.seo_description,
      seoTitle: data.seo_title,
      slug: data.slug,
      status: data.status,
      title: data.title
    };
  } catch {
    return {
      body: { blocks: fallback.blocks },
      excerpt: fallback.excerpt,
      isFallback: true,
      seoDescription: fallback.excerpt,
      seoTitle: fallback.title,
      slug,
      status: "published",
      title: fallback.title
    };
  }
});

export async function listContentPagesForAdmin() {
  await requireStaff(["owner", "admin_ops", "editor"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("id, slug, title, status, excerpt, body, seo_title, seo_description, published_at, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const existing = (data ?? []) as ContentPageView[];
  const missing = REQUIRED_CONTENT_SLUGS.filter(
    (slug) => !existing.some((page) => page.slug === slug)
  ).map((slug) => {
    const fallback = fallbackContent[slug];

    return {
      body: { blocks: fallback.blocks },
      created_at: "",
      excerpt: fallback.excerpt,
      id: `fallback-${slug}`,
      published_at: null,
      seo_description: fallback.excerpt,
      seo_title: fallback.title,
      slug,
      status: "draft" as const,
      title: fallback.title,
      updated_at: ""
    };
  });

  return [...existing, ...missing];
}

export async function getContentPageForAdmin(slug: string) {
  await requireStaff(["owner", "admin_ops", "editor"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("id, slug, title, status, excerpt, body, seo_title, seo_description, published_at, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data as ContentPageView;
  }

  const fallbackSlug = REQUIRED_CONTENT_SLUGS.includes(slug as RequiredContentSlug)
    ? (slug as RequiredContentSlug)
    : "home";
  const fallback = fallbackContent[fallbackSlug];

  return {
    body: { blocks: fallback.blocks },
    created_at: "",
    excerpt: fallback.excerpt,
    id: `fallback-${slug}`,
    published_at: null,
    seo_description: fallback.excerpt,
    seo_title: fallback.title,
    slug,
    status: "draft" as const,
    title: fallback.title,
    updated_at: ""
  };
}
