import type { ContentPageStatus } from "@/types/database";

export type ContentBlock =
  | {
      eyebrow?: string;
      imageAlt?: string;
      imageUrl?: string;
      primaryHref?: string;
      primaryLabel?: string;
      secondaryHref?: string;
      secondaryLabel?: string;
      text?: string;
      title: string;
      type: "hero";
    }
  | {
      eyebrow?: string;
      text: string;
      title: string;
      type: "text";
    }
  | {
      alt?: string;
      caption?: string;
      imageUrl: string;
      title?: string;
      type: "image";
    }
  | {
      items: { answer: string; question: string }[];
      title: string;
      type: "faq";
    }
  | {
      ctaHref?: string;
      ctaLabel?: string;
      eyebrow?: string;
      items: { description: string; imageUrl?: string; title: string }[];
      title: string;
      type: "campaign";
    };

export type ContentBody = {
  blocks: ContentBlock[];
};

export type ContentPageFormState = {
  blocks: ContentBlock[];
  excerpt: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: ContentPageStatus;
  title: string;
};
