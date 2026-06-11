import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/features/account/account-utils";
import { revokeWalletLink } from "@/features/wallets/actions";
import { WalletConnectPanel } from "@/features/wallets/wallet-connect-panel";
import {
  listAccountClaimReservations,
  listAccountUserWallets,
  listAccountWalletLinks
} from "@/features/wallets/queries";

type AccountWalletsPageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    sign?: string;
  }>;
};

export default async function AccountWalletsPage({ searchParams }: AccountWalletsPageProps) {
  const [walletLinks, wallets, reservations, params] = await Promise.all([
    listAccountWalletLinks(),
    listAccountUserWallets(),
    listAccountClaimReservations(),
    searchParams
  ]);
  const pendingLinks = walletLinks.filter((wallet) => wallet.status === "pending");

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="font-display text-title-lg text-paper">Cuzdanlarim</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          NFT-ready kimlik icin cuzdan sahipligi dogrulamasi. Hukuk onayi gelmeden
          mint, satis, odeme, token transferi veya zincir uzerinde claim islemi acilmaz.
        </p>
      </div>

      {params?.saved ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
          Islem tamamlandi: {params.saved}
        </div>
      ) : null}
      {params?.error ? (
        <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
          Cuzdan islemi tamamlanamadi: {params.error}
        </div>
      ) : null}

      <WalletConnectPanel
        pendingLinks={pendingLinks}
        projectId={process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}
      />

      <section className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <h3 className="font-display text-title-md text-paper">Bagli cuzdanlar</h3>
        <div className="mt-5 grid gap-3">
          {wallets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henuz dogrulanmis cuzdan yok.</p>
          ) : null}
          {wallets.map((wallet) => (
            <article
              className="grid gap-3 rounded-md border border-border bg-ink-soft p-4 md:grid-cols-[1fr_auto] md:items-center"
              key={wallet.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="gold">Dogrulanmis sahiplik</Badge>
                  <Badge variant="secondary">{wallet.provider}</Badge>
                  {wallet.chain_id ? <Badge variant="outline">Chain {wallet.chain_id}</Badge> : null}
                  {wallet.is_primary ? <Badge variant="outline">Primary</Badge> : null}
                </div>
                <p className="mt-3 break-all font-mono text-sm text-paper">
                  {wallet.normalized_address}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ilk dogrulama: {formatDateTime(wallet.verified_at)}
                </p>
              </div>
              <form action={revokeWalletLink}>
                <input name="wallet_id" type="hidden" value={wallet.id} />
                <Button type="submit" variant="outline">
                  Kaldir
                </Button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <h3 className="font-display text-title-md text-paper">Allowlist rezervasyonlari</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Bu alan sadece hazirlik kaydidir. Zincir uzerinde claim/mint islemi baslatmaz.
        </p>
        <div className="mt-5 grid gap-3">
          {reservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aktif rezervasyon yok.</p>
          ) : null}
          {reservations.map((reservation) => (
            <article className="rounded-md border border-border bg-ink-soft p-4" key={reservation.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{reservation.status}</Badge>
                {reservation.nft_collections ? (
                  <Badge variant="secondary">{reservation.nft_collections.title}</Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-paper">
                {reservation.nft_items?.title ?? reservation.allowlist_reason ?? "Gelecek claim rezervasyonu"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Claim acilisi: {formatDateTime(reservation.claim_opens_at)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
