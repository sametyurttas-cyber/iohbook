import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AccountNav } from "@/components/layout/account-nav";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { signOut } from "@/features/auth/actions";
import { getAccountProfile, requireAccountUser } from "@/features/account/queries";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireAccountUser();
  const profile = await getAccountProfile();

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section className="pb-8 pt-10">
          <Container>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-eyebrow uppercase text-muted-foreground">Musteri hesabi</p>
                <h1 className="mt-3 font-display text-display-sm text-paper">Hesabim</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Siparislerinizi takip edin, adres bilgilerinizi kontrol edin ve destek
                  sureclerinde kullanilan hesap bilgilerinizi gozden gecirin.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Oturum: {profile?.email ?? user.email}
                </p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="outline">
                  Cikis yap
                </Button>
              </form>
            </div>
            <div className="mt-8">
              <AccountNav />
            </div>
          </Container>
        </Section>
        <Section tone="muted">
          <Container>{children}</Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
