import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { updateTokenAllocation } from "@/features/token-sale/actions";
import { listTokenAllocationsForAdmin } from "@/features/token-sale/queries";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount } from "@/features/token-sale/utils";

export default async function AdminTokenSalesPage() {
  const allocations = await listTokenAllocationsForAdmin();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-eyebrow uppercase text-muted-foreground">Token operations</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Token satislari</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Otomatik transfer yok. Admin manuel gonderim durumunu ve transaction hash alanini yonetir.
        </p>
      </div>

      <div className="grid gap-4">
        {allocations.map((allocation) => (
          <article className="rounded-lg border border-border bg-card p-5 shadow-panel" key={allocation.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={allocation.status === "sent" ? "gold" : "outline"}>
                    {allocation.status}
                  </Badge>
                  <Badge variant="secondary">{allocation.token_symbol}</Badge>
                  <Badge variant="outline">{allocation.orders?.payment_attempts?.[0]?.status ?? "odeme yok"}</Badge>
                </div>
                <h2 className="mt-3 font-display text-title-md text-paper">
                  {allocation.token_sale_campaigns?.title ?? "Token kampanyasi"}
                </h2>
                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                  {allocation.normalized_address}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-paper">
                  {formatTokenAmount(allocation.total_amount)} {allocation.token_symbol}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {formatMoney(allocation.total_price_minor, allocation.currency)}
                </p>
              </div>
            </div>

            <form action={updateTokenAllocation} className="mt-5 grid gap-3 border-t border-border pt-5 md:grid-cols-[1fr_2fr_auto]">
              <input name="allocation_id" type="hidden" value={allocation.id} />
              <Select defaultValue={allocation.status} name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Allocation durumu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Input
                defaultValue={allocation.manual_transfer_tx_hash ?? ""}
                name="manual_transfer_tx_hash"
                placeholder="Transaction hash (sent icin zorunlu)"
              />
              <Button type="submit">Guncelle</Button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
