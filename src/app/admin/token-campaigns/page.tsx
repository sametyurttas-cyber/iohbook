import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createTokenCampaign, createTokenPackage } from "@/features/token-sale/actions";
import { listTokenCampaignsForAdmin } from "@/features/token-sale/queries";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount } from "@/features/token-sale/utils";

export default async function AdminTokenCampaignsPage() {
  const campaigns = await listTokenCampaignsForAdmin();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-eyebrow uppercase text-muted-foreground">Token sale</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Token kampanyalari</h1>
      </div>

      <form action={createTokenCampaign} className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel">
        <h2 className="font-display text-title-md text-paper">Yeni kampanya</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="title" placeholder="Kampanya adi" required />
          <Input name="slug" placeholder="slug" />
          <Input name="token_symbol" placeholder="TOKEN sembolu" required />
          <Input name="total_sale_limit" placeholder="Toplam satis limiti" required />
          <Input name="per_user_limit" placeholder="Kisi basi limit" />
          <Input name="price" placeholder="Birim fiyat" required />
          <Input name="currency" placeholder="USD" defaultValue="USD" />
          <Input name="bonus_bps" placeholder="Bonus bps: 1000 = %10" defaultValue="0" />
          <Input name="starts_at" type="datetime-local" />
          <Input name="ends_at" type="datetime-local" />
        </div>
        <Textarea name="description" placeholder="Aciklama" />
        <Select defaultValue="draft" name="status">
          <SelectTrigger>
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="paused">Duraklatildi</SelectItem>
            <SelectItem value="ended">Bitti</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <label className="flex items-center gap-2">
            <input className="h-4 w-4 accent-gold" name="legal_approved" type="checkbox" />
            Yasal/uyum onayi alindi
          </label>
          <label className="flex items-center gap-2">
            <input className="h-4 w-4 accent-gold" name="sales_enabled" type="checkbox" />
            Satisi aktif et
          </label>
        </div>
        <Button type="submit">Kampanya olustur</Button>
      </form>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <section className="rounded-lg border border-border bg-card p-5 shadow-panel" key={campaign.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={campaign.sales_enabled ? "gold" : "outline"}>{campaign.status}</Badge>
                  <Badge variant="secondary">{campaign.token_symbol}</Badge>
                </div>
                <h2 className="mt-3 font-display text-title-md text-paper">{campaign.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{campaign.description}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{formatMoney(campaign.price_minor, campaign.currency)}</p>
                <p>Limit: {formatTokenAmount(campaign.total_sale_limit)}</p>
              </div>
            </div>

            <form action={createTokenPackage} className="mt-5 grid gap-3 border-t border-border pt-5 md:grid-cols-6">
              <input name="campaign_id" type="hidden" value={campaign.id} />
              <Input className="md:col-span-2" name="title" placeholder="Paket adi" required />
              <Input name="token_amount" placeholder="Token miktari" required />
              <Input name="price" placeholder="Fiyat" required />
              <Input name="currency" placeholder={campaign.currency} defaultValue={campaign.currency} />
              <Input name="max_quantity_per_order" placeholder="Max adet" />
              <Input name="sort_order" placeholder="Sira" defaultValue="0" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input className="h-4 w-4 accent-gold" defaultChecked name="active" type="checkbox" />
                Aktif
              </label>
              <Button className="md:col-span-2" type="submit">Paket ekle</Button>
            </form>

            <div className="mt-4 grid gap-2">
              {campaign.token_sale_packages.map((pkg) => (
                <div className="flex justify-between rounded-md border border-border bg-ink-soft p-3 text-sm" key={pkg.id}>
                  <span className="text-paper">{pkg.title}</span>
                  <span className="text-muted-foreground">
                    {formatTokenAmount(pkg.token_amount)} {campaign.token_symbol} - {formatMoney(pkg.price_minor, pkg.currency)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
