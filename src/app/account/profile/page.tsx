import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateCommunicationPreferences } from "@/features/account/actions";
import {
  getAccountPointBalance,
  getAccountProfile,
  getAccountOrderCount,
  listAccountPointLedger,
  requireAccountUser
} from "@/features/account/queries";
import { formatDateTime } from "@/features/account/account-utils";
import { formatIohPointReason } from "@/features/points/queries";

type AccountProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AccountProfilePage({ searchParams }: AccountProfilePageProps) {
  const [user, profile, points, pointLedger, orderCount] = await Promise.all([
    requireAccountUser(),
    getAccountProfile(),
    getAccountPointBalance(),
    listAccountPointLedger(5),
    getAccountOrderCount()
  ]);
  const params = await searchParams;
  const pointProgress = Math.min(points.balance, 100);

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

      <div className="rounded-lg border border-gold/25 bg-gold/10 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="gold">IOH Puan</Badge>
            <h3 className="mt-3 font-display text-title-md text-paper">IOH puan bakiyesi</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Uye olma ve basarili kitap siparislerinden kazandiginiz uygulama ici puanlar.
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-bold text-gold">{points.balance}</p>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">IOH puan</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-mist/75">
            <span>Sonraki hedef</span>
            <span>{pointProgress}/100 IOH</span>
          </div>
          <div
            aria-label="IOH puan ilerleme bari"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={pointProgress}
            className="h-3 overflow-hidden rounded-full border border-gold/20 bg-ink/70"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-gold shadow-glow transition-[width]"
              style={{ width: `${pointProgress}%` }}
            />
          </div>
          {points.balance > 100 ? (
            <p className="mt-2 text-xs text-mist/70">
              Bar 100 IOH hedefinde dolu gorunur; gercek bakiyeniz yukarida yaziyor.
            </p>
          ) : null}
        </div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Toplam kazanilan</dt>
            <dd className="mt-1 text-paper">{points.lifetimeEarned} IOH</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Toplam kullanilan</dt>
            <dd className="mt-1 text-paper">{points.lifetimeSpent} IOH</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Siparis sayisi</dt>
            <dd className="mt-1 text-paper">{orderCount}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-title-md text-paper">Puan gecmisi</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Son IOH puan hareketleriniz burada gorunur.
            </p>
          </div>
          <Badge variant="outline">Son {pointLedger.length}</Badge>
        </div>
        {pointLedger.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {pointLedger.map((entry) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-ink-soft p-4"
                key={entry.id}
              >
                <div>
                  <p className="text-sm font-semibold text-paper">
                    {formatIohPointReason(entry.reason)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(entry.created_at)}
                    {entry.order_id ? ` - Siparis: ${entry.order_id.slice(0, 8)}` : ""}
                  </p>
                </div>
                <p className="font-display text-title-md text-gold">
                  {entry.amount > 0 ? "+" : ""}
                  {entry.amount} IOH
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-white/10 bg-ink-soft p-4 text-sm text-muted-foreground">
            Henuz puan hareketi yok. Uye bonusu veya basarili kitap siparisi sonrasi burada
            gorunur.
          </div>
        )}
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
