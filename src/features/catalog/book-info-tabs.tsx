"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StorefrontBook, StorefrontVariant } from "@/features/catalog/queries";

type BookInfoTabsProps = {
  book: StorefrontBook;
  variants: StorefrontVariant[];
};

export function BookInfoTabs({ book, variants }: BookInfoTabsProps) {
  const firstVariant = variants[0];

  return (
    <Tabs className="rounded-lg border border-border bg-card p-5" defaultValue="summary">
      <TabsList>
        <TabsTrigger value="summary">Ozet</TabsTrigger>
        <TabsTrigger value="technical">Teknik bilgi</TabsTrigger>
        <TabsTrigger value="delivery">Teslimat</TabsTrigger>
      </TabsList>
      <TabsContent className="pt-4" value="summary">
        <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
          {book.description ??
            book.short_description ??
            "Bu kitap icin editoryal aciklama yakinda eklenecek."}
        </p>
      </TabsContent>
      <TabsContent className="pt-4" value="technical">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Urun tipi</dt>
            <dd className="mt-1 text-paper">{book.type}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Varyant sayisi</dt>
            <dd className="mt-1 text-paper">{variants.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Format</dt>
            <dd className="mt-1 text-paper">
              {firstVariant?.title ?? "Dijital format yakinda"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Koleksiyon</dt>
            <dd className="mt-1 text-paper">{book.collections?.title ?? "IOH"}</dd>
          </div>
        </dl>
      </TabsContent>
      <TabsContent className="pt-4" value="delivery">
        <p className="text-sm leading-7 text-muted-foreground">
          Dijital kitaplar odeme onayindan sonra Hesabim &gt; Indirmelerim alaninda
          guvenli indirme linkiyle acilir. Dosyalar public bucket'ta tutulmaz.
        </p>
      </TabsContent>
    </Tabs>
  );
}
