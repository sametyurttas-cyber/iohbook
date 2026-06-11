import { Badge } from "@/components/ui/badge";
import { listAccountTokenAllocations } from "@/features/token-sale/queries";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount } from "@/features/token-sale/utils";

export default async function AccountTokenAllocationsPage() {
  const allocations = await listAccountTokenAllocations();

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="font-display text-title-lg text-paper">Token Haklarim / Allocations</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Odeme backend tarafinda dogrulandiktan sonra token haklariniz burada gorunur.
          Otomatik transfer yoktur; manuel gonderim admin tarafindan tamamlanir.
        </p>
      </div>

      {allocations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground shadow-panel">
          Henuz token allocation yok.
        </div>
      ) : (
        <div className="grid gap-3">
          {allocations.map((allocation) => (
            <article className="rounded-lg border border-border bg-card p-5 shadow-panel" key={allocation.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={allocation.status === "sent" ? "gold" : "outline"}>
                  {allocation.status}
                </Badge>
                <Badge variant="secondary">{allocation.token_symbol}</Badge>
                <span className="text-xs text-muted-foreground">
                  {allocation.orders?.order_number ?? "-"}
                </span>
              </div>
              <h3 className="mt-3 font-display text-title-md text-paper">
                {allocation.token_sale_campaigns?.title ?? "Token allocation"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Allocation: {formatTokenAmount(allocation.total_amount)} {allocation.token_symbol}
                {" "}({formatMoney(allocation.total_price_minor, allocation.currency)})
              </p>
              {allocation.manual_transfer_tx_hash ? (
                <p className="mt-2 break-all font-mono text-xs text-gold">
                  TX: {allocation.manual_transfer_tx_hash}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
