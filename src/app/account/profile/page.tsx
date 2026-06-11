import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateCommunicationPreferences } from "@/features/account/actions";
import { getAccountProfile, requireAccountUser } from "@/features/account/queries";
import { formatDateTime } from "@/features/account/account-utils";

type AccountProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AccountProfilePage({ searchParams }: AccountProfilePageProps) {
  const [user, profile] = await Promise.all([requireAccountUser(), getAccountProfile()]);
  const params = await searchParams;

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="font-display text-title-lg text-paper">Profilim</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Bu bilgiler destek ekibinin hesabinizi hizli bulmasina yardim eder. Profil
          duzenleme, pazarlama tercihleri ve telefon dogrulama sonraki adimda genisletilebilir.
        </p>
      </div>

      {params?.saved === "preferences" ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          Iletisim izinleriniz guncellendi.
        </div>
      ) : null}
      {params?.error ? (
        <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 px-4 py-3 text-sm text-burgundy-soft">
          Tercihler kaydedilemedi: {params.error}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="gold">Account</Badge>
          <Badge variant="outline">{profile?.locale ?? "en"}</Badge>
        </div>
        <dl className="mt-6 grid gap-5 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-1 text-paper">{profile?.email ?? user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ad soyad</dt>
            <dd className="mt-1 text-paper">{profile?.full_name ?? "Henuz eklenmedi"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefon</dt>
            <dd className="mt-1 text-paper">{profile?.phone ?? "Henuz eklenmedi"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Olusturma</dt>
            <dd className="mt-1 text-paper">{formatDateTime(profile?.created_at ?? null)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">E-posta izni</dt>
            <dd className="mt-1 text-paper">
              {profile?.marketing_email_opt_in ? "Onayli" : "Onay yok"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">SMS izni</dt>
            <dd className="mt-1 text-paper">
              {profile?.marketing_sms_opt_in ? "Onayli" : "Onay yok"}
            </dd>
          </div>
        </dl>
      </div>

      <form
        action={updateCommunicationPreferences}
        className="rounded-lg border border-border bg-card p-6 shadow-panel"
      >
        <h3 className="font-display text-title-md text-paper">Iletisim izinleri</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Bu alanlar acik riza kapsamindadir; KVKK aydinlatma metnini okumakla
          pazarlama izni vermis olmazsiniz. Izinleri istediginiz zaman kapatabilirsiniz.
        </p>
        <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
          <label className="flex items-start gap-3 rounded-md border border-border bg-ink-soft p-4">
            <input
              className="mt-1 h-4 w-4 accent-gold"
              defaultChecked={profile?.marketing_email_opt_in ?? false}
              name="email_marketing_consent"
              type="checkbox"
            />
            E-posta ile kampanya, yeni kitap ve koleksiyon duyurulari almak istiyorum.
          </label>
          <label className="flex items-start gap-3 rounded-md border border-border bg-ink-soft p-4">
            <input
              className="mt-1 h-4 w-4 accent-gold"
              defaultChecked={profile?.marketing_sms_opt_in ?? false}
              name="sms_marketing_consent"
              type="checkbox"
            />
            SMS/telefon kanaliyla kampanya ve siparis disi duyuru almak istiyorum.
          </label>
        </div>
        <Button className="mt-5" type="submit">
          Izinleri kaydet
        </Button>
      </form>
    </div>
  );
}
