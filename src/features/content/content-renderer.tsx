import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { Section } from "@/components/layout/section";
import type { ContentBlock } from "@/features/content/content-types";

type ContentRendererProps = {
  blocks: ContentBlock[];
};

function Paragraphs({ text }: { text?: string }) {
  if (!text) {
    return null;
  }

  return (
    <>
      {text.split("\n").filter(Boolean).map((line) => (
        <p className="text-sm leading-6 text-muted-foreground" key={line}>
          {line}
        </p>
      ))}
    </>
  );
}

function HeroBlock({ block }: { block: Extract<ContentBlock, { type: "hero" }> }) {
  return (
    <Section className="relative overflow-hidden pb-18 pt-12 md:pb-26 md:pt-18">
      <Container className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          {block.eyebrow ? <Badge variant="gold">{block.eyebrow}</Badge> : null}
          <h1 className="mt-6 max-w-4xl font-display text-display-sm text-paper md:text-display-md">
            {block.title}
          </h1>
          <div className="mt-6 grid max-w-2xl gap-3">
            <Paragraphs text={block.text} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {block.primaryHref && block.primaryLabel ? (
              <Button asChild size="lg">
                <Link href={block.primaryHref}>{block.primaryLabel}</Link>
              </Button>
            ) : null}
            {block.secondaryHref && block.secondaryLabel ? (
              <Button asChild size="lg" variant="outline">
                <Link href={block.secondaryHref}>{block.secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[28rem] overflow-hidden rounded-lg border border-border bg-card shadow-panel">
          {block.imageUrl ? (
            <Image
              alt={block.imageAlt ?? block.title}
              className="h-full min-h-[28rem] w-full object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 100vw"
              src={block.imageUrl}
            />
          ) : (
            <div className="relative flex h-full min-h-[28rem] items-end overflow-hidden p-6">
              <div className="absolute right-[-6rem] top-12 h-80 w-80 rounded-full border border-gold/40 bg-gold/10 shadow-glow" />
              <div className="absolute right-10 top-24 h-40 w-40 rounded-full border border-mist-blue/50 bg-mist-blue/10 shadow-glow-blue" />
              <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full border border-burgundy-bright/50 bg-burgundy-bright/10 shadow-glow-red" />
              <p className="relative z-10 font-display text-[5rem] font-bold leading-none text-gold md:text-[7rem]">
                IOH
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

function TextBlock({ block }: { block: Extract<ContentBlock, { type: "text" }> }) {
  return (
    <Section>
      <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          {block.eyebrow ? (
            <p className="text-eyebrow uppercase text-gold">{block.eyebrow}</p>
          ) : null}
          <h2 className="mt-3 font-display text-display-sm text-paper">{block.title}</h2>
        </div>
        <div className="grid gap-3">
          <Paragraphs text={block.text} />
        </div>
      </Container>
    </Section>
  );
}

function ImageBlock({ block }: { block: Extract<ContentBlock, { type: "image" }> }) {
  return (
    <Section tone="muted">
      <Container>
        {block.title ? (
          <h2 className="mb-6 font-display text-display-sm text-paper">{block.title}</h2>
        ) : null}
        <div className="relative aspect-[16/9] max-h-[42rem] w-full overflow-hidden rounded-lg border border-border shadow-panel">
          <Image
            alt={block.alt ?? block.title ?? "Content image"}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 1120px, 100vw"
            src={block.imageUrl}
          />
        </div>
        {block.caption ? (
          <p className="mt-3 text-sm text-muted-foreground">{block.caption}</p>
        ) : null}
      </Container>
    </Section>
  );
}

function CampaignBlock({ block }: { block: Extract<ContentBlock, { type: "campaign" }> }) {
  return (
    <Section tone="muted">
      <Container>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            {block.eyebrow ? (
              <p className="text-eyebrow uppercase text-gold">{block.eyebrow}</p>
            ) : null}
            <h2 className="mt-3 font-display text-display-sm text-paper">{block.title}</h2>
          </div>
          {block.ctaHref && block.ctaLabel ? (
            <Button asChild variant="outline">
              <Link href={block.ctaHref}>{block.ctaLabel}</Link>
            </Button>
          ) : null}
        </div>
        <ResponsiveGrid className="mt-8" columns={3}>
          {block.items.map((item) => (
            <article
              className="rounded-lg border border-border bg-card p-5 shadow-panel"
              key={`${block.title}-${item.title}`}
            >
              {item.imageUrl ? (
                <div className="relative h-64 w-full overflow-hidden rounded-md border border-border">
                  <Image
                    alt={item.title}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    src={item.imageUrl}
                  />
                </div>
              ) : (
                <div className="h-64 rounded-md border border-gold/30 bg-gold/10 shadow-glow" />
              )}
              <h3 className="mt-5 font-display text-title-lg text-paper">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </ResponsiveGrid>
      </Container>
    </Section>
  );
}

function FaqBlock({ block }: { block: Extract<ContentBlock, { type: "faq" }> }) {
  return (
    <Section>
      <Container className="max-w-4xl">
        <h2 className="font-display text-display-sm text-paper">{block.title}</h2>
        <div className="mt-8 grid gap-3">
          {block.items.map((item) => (
            <details
              className="rounded-lg border border-border bg-card p-5 text-sm"
              key={item.question}
            >
              <summary className="cursor-pointer font-semibold text-paper">
                {item.question}
              </summary>
              <p className="mt-3 leading-6 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ContentRenderer({ blocks }: ContentRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "hero") {
          return <HeroBlock block={block} key={key} />;
        }

        if (block.type === "text") {
          return <TextBlock block={block} key={key} />;
        }

        if (block.type === "image" && block.imageUrl) {
          return <ImageBlock block={block} key={key} />;
        }

        if (block.type === "campaign") {
          return <CampaignBlock block={block} key={key} />;
        }

        if (block.type === "faq") {
          return <FaqBlock block={block} key={key} />;
        }

        return null;
      })}
    </>
  );
}
