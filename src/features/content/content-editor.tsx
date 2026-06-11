"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveContentPage } from "@/features/content/actions";
import type { ContentBlock, ContentPageFormState } from "@/features/content/content-types";

type ContentEditorProps = {
  initial: ContentPageFormState;
};

const emptyBlocks: Record<ContentBlock["type"], ContentBlock> = {
  campaign: {
    items: [{ description: "", title: "Yeni kampanya" }],
    title: "Kampanya bloklari",
    type: "campaign"
  },
  faq: {
    items: [{ answer: "", question: "Soru" }],
    title: "Sik sorulan sorular",
    type: "faq"
  },
  hero: {
    primaryHref: "/books",
    primaryLabel: "Kitaplari Incele",
    text: "",
    title: "Baslik",
    type: "hero"
  },
  image: {
    imageUrl: "",
    title: "Gorsel",
    type: "image"
  },
  text: {
    text: "",
    title: "Metin blogu",
    type: "text"
  }
};

function updateBlock<T extends ContentBlock>(
  block: T,
  patch: Partial<T>
) {
  return { ...block, ...patch } as ContentBlock;
}

export function ContentEditor({ initial }: ContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initial.blocks);
  const bodyJson = useMemo(() => JSON.stringify({ blocks }), [blocks]);

  function replaceBlock(index: number, block: ContentBlock) {
    setBlocks((current) => current.map((item, itemIndex) => (itemIndex === index ? block : item)));
  }

  function removeBlock(index: number) {
    setBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function addBlock(type: ContentBlock["type"]) {
    setBlocks((current) => [...current, structuredClone(emptyBlocks[type])]);
  }

  return (
    <form action={saveContentPage} className="grid gap-6">
      <input name="body_json" type="hidden" value={bodyJson} />
      <section className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Baslik</span>
            <Input defaultValue={initial.title} name="title" required />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Slug</span>
            <Input defaultValue={initial.slug} name="slug" required />
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Kisa aciklama</span>
          <Textarea defaultValue={initial.excerpt} name="excerpt" rows={3} />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Durum</span>
            <select
              className="h-10 rounded-md border border-input bg-ink-soft px-3 text-sm text-foreground"
              defaultValue={initial.status}
              name="status"
            >
              <option value="draft">Taslak</option>
              <option value="published">Yayinda</option>
              <option value="archived">Arsiv</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="text-muted-foreground">SEO baslik</span>
            <Input defaultValue={initial.seoTitle} name="seo_title" />
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">SEO aciklama</span>
          <Textarea defaultValue={initial.seoDescription} name="seo_description" rows={2} />
        </label>
      </section>

      <section className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-eyebrow uppercase text-muted-foreground">Rich blocks</p>
            <h2 className="mt-2 font-display text-title-md text-paper">Sayfa icerigi</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["hero", "text", "image", "faq", "campaign"] as const).map((type) => (
              <Button key={type} onClick={() => addBlock(type)} type="button" variant="outline">
                + {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {blocks.map((block, index) => (
            <article className="grid gap-4 rounded-md border border-border bg-ink-soft p-4" key={`${block.type}-${index}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                  {index + 1}. {block.type}
                </p>
                <Button onClick={() => removeBlock(index)} size="sm" type="button" variant="outline">
                  Sil
                </Button>
              </div>

              {block.type === "hero" ? (
                <div className="grid gap-3">
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { eyebrow: event.target.value }))}
                    placeholder="Eyebrow"
                    value={block.eyebrow ?? ""}
                  />
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { title: event.target.value }))}
                    placeholder="Baslik"
                    value={block.title}
                  />
                  <Textarea
                    onChange={(event) => replaceBlock(index, updateBlock(block, { text: event.target.value }))}
                    placeholder="Metin"
                    rows={4}
                    value={block.text ?? ""}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      onChange={(event) => replaceBlock(index, updateBlock(block, { primaryLabel: event.target.value }))}
                      placeholder="Birincil buton etiketi"
                      value={block.primaryLabel ?? ""}
                    />
                    <Input
                      onChange={(event) => replaceBlock(index, updateBlock(block, { primaryHref: event.target.value }))}
                      placeholder="Birincil buton linki"
                      value={block.primaryHref ?? ""}
                    />
                    <Input
                      onChange={(event) => replaceBlock(index, updateBlock(block, { secondaryLabel: event.target.value }))}
                      placeholder="Ikincil buton etiketi"
                      value={block.secondaryLabel ?? ""}
                    />
                    <Input
                      onChange={(event) => replaceBlock(index, updateBlock(block, { secondaryHref: event.target.value }))}
                      placeholder="Ikincil buton linki"
                      value={block.secondaryHref ?? ""}
                    />
                  </div>
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { imageUrl: event.target.value }))}
                    placeholder="Hero gorsel URL"
                    value={block.imageUrl ?? ""}
                  />
                </div>
              ) : null}

              {block.type === "text" ? (
                <div className="grid gap-3">
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { eyebrow: event.target.value }))}
                    placeholder="Eyebrow"
                    value={block.eyebrow ?? ""}
                  />
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { title: event.target.value }))}
                    placeholder="Baslik"
                    value={block.title}
                  />
                  <Textarea
                    onChange={(event) => replaceBlock(index, updateBlock(block, { text: event.target.value }))}
                    placeholder="Metin"
                    rows={6}
                    value={block.text}
                  />
                </div>
              ) : null}

              {block.type === "image" ? (
                <div className="grid gap-3">
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { title: event.target.value }))}
                    placeholder="Baslik"
                    value={block.title ?? ""}
                  />
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { imageUrl: event.target.value }))}
                    placeholder="Gorsel URL"
                    value={block.imageUrl}
                  />
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { alt: event.target.value }))}
                    placeholder="Alt metin"
                    value={block.alt ?? ""}
                  />
                  <Textarea
                    onChange={(event) => replaceBlock(index, updateBlock(block, { caption: event.target.value }))}
                    placeholder="Aciklama"
                    rows={2}
                    value={block.caption ?? ""}
                  />
                </div>
              ) : null}

              {block.type === "faq" ? (
                <div className="grid gap-3">
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { title: event.target.value }))}
                    placeholder="Baslik"
                    value={block.title}
                  />
                  {block.items.map((item, itemIndex) => (
                    <div className="grid gap-2 rounded-md border border-border p-3" key={`${item.question}-${itemIndex}`}>
                      <Input
                        onChange={(event) => {
                          const items = block.items.map((current, currentIndex) =>
                            currentIndex === itemIndex ? { ...current, question: event.target.value } : current
                          );
                          replaceBlock(index, updateBlock(block, { items }));
                        }}
                        placeholder="Soru"
                        value={item.question}
                      />
                      <Textarea
                        onChange={(event) => {
                          const items = block.items.map((current, currentIndex) =>
                            currentIndex === itemIndex ? { ...current, answer: event.target.value } : current
                          );
                          replaceBlock(index, updateBlock(block, { items }));
                        }}
                        placeholder="Cevap"
                        rows={3}
                        value={item.answer}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => replaceBlock(index, updateBlock(block, { items: [...block.items, { answer: "", question: "Yeni soru" }] }))}
                    type="button"
                    variant="outline"
                  >
                    Soru ekle
                  </Button>
                </div>
              ) : null}

              {block.type === "campaign" ? (
                <div className="grid gap-3">
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { eyebrow: event.target.value }))}
                    placeholder="Eyebrow"
                    value={block.eyebrow ?? ""}
                  />
                  <Input
                    onChange={(event) => replaceBlock(index, updateBlock(block, { title: event.target.value }))}
                    placeholder="Baslik"
                    value={block.title}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      onChange={(event) => replaceBlock(index, updateBlock(block, { ctaLabel: event.target.value }))}
                      placeholder="CTA etiketi"
                      value={block.ctaLabel ?? ""}
                    />
                    <Input
                      onChange={(event) => replaceBlock(index, updateBlock(block, { ctaHref: event.target.value }))}
                      placeholder="CTA linki"
                      value={block.ctaHref ?? ""}
                    />
                  </div>
                  {block.items.map((item, itemIndex) => (
                    <div className="grid gap-2 rounded-md border border-border p-3" key={`${item.title}-${itemIndex}`}>
                      <Input
                        onChange={(event) => {
                          const items = block.items.map((current, currentIndex) =>
                            currentIndex === itemIndex ? { ...current, title: event.target.value } : current
                          );
                          replaceBlock(index, updateBlock(block, { items }));
                        }}
                        placeholder="Kart basligi"
                        value={item.title}
                      />
                      <Textarea
                        onChange={(event) => {
                          const items = block.items.map((current, currentIndex) =>
                            currentIndex === itemIndex ? { ...current, description: event.target.value } : current
                          );
                          replaceBlock(index, updateBlock(block, { items }));
                        }}
                        placeholder="Kart metni"
                        rows={3}
                        value={item.description}
                      />
                      <Input
                        onChange={(event) => {
                          const items = block.items.map((current, currentIndex) =>
                            currentIndex === itemIndex ? { ...current, imageUrl: event.target.value } : current
                          );
                          replaceBlock(index, updateBlock(block, { items }));
                        }}
                        placeholder="Kart gorsel URL"
                        value={item.imageUrl ?? ""}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => replaceBlock(index, updateBlock(block, { items: [...block.items, { description: "", title: "Yeni kart" }] }))}
                    type="button"
                    variant="outline"
                  >
                    Kampanya karti ekle
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button size="lg" type="submit">
          Icerigi kaydet
        </Button>
      </div>
    </form>
  );
}
