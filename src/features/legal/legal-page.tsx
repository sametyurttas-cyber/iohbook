import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CookiePreferencesForm } from "@/features/legal/cookie-preferences-form";
import { LEGAL_DOCUMENT_VERSION, type LegalDocument } from "@/features/legal/legal-content";

type LegalPageProps = {
  document: LegalDocument;
  showCookiePreferences?: boolean;
};

export function LegalPage({ document, showCookiePreferences = false }: LegalPageProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb
              items={[
                { href: "/", label: "Ana Sayfa" },
                { label: document.title }
              ]}
            />
            <div className="mt-10 max-w-3xl">
              <p className="text-eyebrow uppercase text-gold">Legal / v{LEGAL_DOCUMENT_VERSION}</p>
              <h1 className="mt-5 font-display text-display-sm text-paper">{document.title}</h1>
              <p className="mt-4 text-body text-muted-foreground">{document.description}</p>
              <p className="mt-4 rounded-md border border-gold/20 bg-gold/10 p-3 text-sm leading-6 text-gold">
                Bu metin profesyonel e-ticaret mimarisi icin hazirlanmis taslak
                iceriktir. Canli kullanimdan once sirket bilgileri ve nihai hukumler
                hukuk danismani tarafindan onaylanmalidir.
              </p>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container className="grid gap-5">
            {document.sections.map((section) => (
              <article className="rounded-lg border border-border bg-card p-6 shadow-panel" key={section.title}>
                <h2 className="font-display text-title-lg text-paper">{section.title}</h2>
                <div className="mt-4 grid gap-3">
                  {section.body.map((paragraph) => (
                    <p className="text-sm leading-6 text-muted-foreground" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            {showCookiePreferences ? <CookiePreferencesForm /> : null}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
