import { jsonLdScript } from "@/lib/seo";

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={jsonLdScript(data)}
      type="application/ld+json"
    />
  );
}
