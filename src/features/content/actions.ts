"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import type { ContentBody } from "@/features/content/content-types";
import { slugify } from "@/features/products/product-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentPageStatus } from "@/types/database";

function parseOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parseBody(value: FormDataEntryValue | null): ContentBody {
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];

    return { blocks };
  } catch {
    return { blocks: [] };
  }
}

export async function saveContentPage(formData: FormData) {
  const staff = await requireStaff(["owner", "admin_ops", "editor"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  const rawSlug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(rawSlug || title);
  const status = String(formData.get("status") ?? "draft") as ContentPageStatus;

  if (!slug || !title) {
    redirect("/admin/content?error=missing-title");
  }

  const payload = {
    body: parseBody(formData.get("body_json")),
    excerpt: parseOptionalString(formData.get("excerpt")),
    published_at: status === "published" ? new Date().toISOString() : null,
    seo_description: parseOptionalString(formData.get("seo_description")),
    seo_title: parseOptionalString(formData.get("seo_title")),
    slug,
    status,
    title,
    updated_by: staff.user.id
  };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("content_pages").upsert(
    {
      ...payload,
      created_by: staff.user.id
    },
    { onConflict: "slug" }
  );

  if (error) {
    redirect(`/admin/content/${slug}?error=${encodeURIComponent(error.code ?? "save-failed")}`);
  }

  revalidatePath("/");
  revalidatePath("/author");
  revalidatePath("/contact");
  revalidatePath("/faq");
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${slug}`);
  redirect(`/admin/content/${slug}?saved=content`);
}
