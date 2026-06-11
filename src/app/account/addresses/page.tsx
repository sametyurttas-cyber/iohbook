import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddressLines } from "@/features/account/account-utils";
import { listAccountAddresses } from "@/features/account/queries";

export default async function AccountAddressesPage() {
  const addresses = await listAccountAddresses();

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="font-display text-title-lg text-paper">Adreslerim</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Kayitli adresler checkout hatalarini azaltir. Adres duzenleme bir sonraki
          hesap yonetimi adiminda eklenecek; checkout yine de yeni adres alabilir.
        </p>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 shadow-panel">
          <h3 className="font-display text-title-md text-paper">Kayitli adres yok</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Checkout adresiniz sonraki surumde burada saklanabilecek. Simdilik siparis
            detay sayfasi satin alma anindaki teslimat adresi kopyasini tutar.
          </p>
          <Button disabled className="mt-6" variant="outline">
            Adres duzenleme yakinda
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              className="rounded-lg border border-border bg-card p-5 shadow-panel"
              key={address.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={address.is_default ? "gold" : "outline"}>
                  {address.type === "shipping" ? "Teslimat" : "Fatura"}
                </Badge>
                {address.is_default ? <Badge variant="secondary">Varsayilan</Badge> : null}
              </div>
              <h3 className="mt-4 font-display text-title-md text-paper">
                {address.full_name}
              </h3>
              <div className="mt-3 grid gap-1 text-sm leading-6 text-muted-foreground">
                {formatAddressLines(address).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {address.phone ? (
                <p className="mt-3 text-sm text-muted-foreground">Telefon: {address.phone}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
