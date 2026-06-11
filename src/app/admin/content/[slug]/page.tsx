import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/features/content/content-editor";
import type { ContentBody } from "@/features/content/content-types";
import { getContentPageForAdmin } from "@/features/content/queries";

type AdminContentEditPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AdminContentEditPage({
  params,
  searchParams
}: AdminContentEditPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = await getContentPageForAdmin(slug);
  const body = page.body as ContentBody;

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10" id="main-content">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-eyebrow uppercase text-muted-foreground">Content editor</p>
          <h1 className="mt-3 font-display text-title-lg text-paper">{page.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">/{page.slug}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/content">Icerik listesi</Link>
        </Button>
      </div>

      {query?.saved ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          Icerik kaydedildi.
        </div>
      ) : null}
      {query?.error ? (
        <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 px-4 py-3 text-sm text-burgundy-soft">
          Kayit sirasinda hata olustu: {query.error}
        </div>
      ) : null}

      <ContentEditor
        initial={{
          blocks: Array.isArray(body.blocks) ? body.blocks : [],
          excerpt: page.excerpt ?? "",
          seoDescription: page.seo_description ?? "",
          seoTitle: page.seo_title ?? "",
          slug: page.slug,
          status: page.status,
          title: page.title
        }}
      />
    </main>
  );
}
