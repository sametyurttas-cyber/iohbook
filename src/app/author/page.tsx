import type { Metadata } from "next";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { AuthorManifesto } from "@/features/author/author-manifesto";
import { getHeaderUserView } from "@/features/auth/queries";
import { getPublishedContentPage } from "@/features/content/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("author");

  return buildPageMetadata({
    description:
      page.seoDescription ??
      "Samet Yurttas, IOH Universe'in yaraticisi ve teknoloji, bilinc, guc ve insanlik uzerine yazan bilimkurgu yazari.",
    path: "/author",
    title: page.seoTitle ?? "Samet Yurttas / Creator of IOH Universe"
  });
}

export default async function AuthorPage() {
  const userView = await getHeaderUserView();

  return (
    <>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <IohSceneHeader user={userView} />
      <main id="main-content">
        <AuthorManifesto />
        <BooksIndexFooter />
      </main>
    </>
  );
}
