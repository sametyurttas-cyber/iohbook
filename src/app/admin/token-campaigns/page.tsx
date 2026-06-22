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
import styles from "@/features/admin/admin-scene.module.css";

export default async function AdminTokenCampaignsPage() {
  const campaigns = await listTokenCampaignsForAdmin();

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">CAMPAIGN</div>
            <p className={styles.kicker}>05 / TOKEN KAMPANYALARI</p>
            <h2 className={styles.heroTitle}>Token Kampanyalari</h2>
            <p className={styles.heroLead}>
              IOHcoin kampanya ve paket yonetimi. Yeni kampanya olustur, paket ekle,
              satis ve yayin durumunu yonet.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>Toplam <b>{campaigns.length}</b> kampanya</span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <form action={createTokenCampaign} className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Yeni Kampanya</h3>
            <p className={styles.kicker}>TEMEL BILGILER</p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGrid2}>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Kampanya Adi</span>
                <Input name="title" placeholder="Kampanya adi" required />
              </label>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Slug</span>
                <Input name="slug" placeholder="slug" />
              </label>
            </div>

            <div className={styles.formGrid3}>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>TOKEN Sembolu</span>
                <Input name="token_symbol" placeholder="IOH" required />
              </label>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Birim Fiyat</span>
                <Input name="price" placeholder="10" required />
              </label>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Para Birimi</span>
                <Input name="currency" placeholder="USD" defaultValue="USD" />
              </label>
            </div>

            <div className={styles.formGrid3}>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Toplam Satis Limiti</span>
                <Input name="total_sale_limit" placeholder="1000000" required />
              </label>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Kisi Basi Limit</span>
                <Input name="per_user_limit" placeholder="1000" />
              </label>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Bonus (bps: 1000 = %10)</span>
                <Input name="bonus_bps" placeholder="0" defaultValue="0" />
              </label>
            </div>

            <div className={styles.formGrid2}>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Baslangic</span>
                <Input name="starts_at" type="datetime-local" />
              </label>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>Bitis</span>
                <Input name="ends_at" type="datetime-local" />
              </label>
            </div>

            <label className={styles.formLabel}>
              <span className={styles.formLabelText}>Aciklama</span>
              <Textarea name="description" placeholder="Aciklama" />
            </label>

            <label className={styles.formLabel}>
              <span className={styles.formLabelText}>Durum</span>
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
            </label>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ad-muted)", fontSize: "0.85rem" }}>
                <input className="h-4 w-4" style={{ accentColor: "var(--ad-gold)" }} name="legal_approved" type="checkbox" />
                Yasal/uyum onayi alindi
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ad-muted)", fontSize: "0.85rem" }}>
                <input className="h-4 w-4" style={{ accentColor: "var(--ad-gold)" }} name="sales_enabled" type="checkbox" />
                Satisi aktif et
              </label>
            </div>

            <Button type="submit">Kampanya Olustur</Button>
          </div>
        </form>

        <div className={styles.grid}>
          {campaigns.map((campaign) => (
            <section className={styles.panel} key={campaign.id}>
              <div className={styles.panelHead}>
                <div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span className={styles.badge + " " + (campaign.sales_enabled ? styles.badgeGold : "")}>
                      {campaign.status}
                    </span>
                    <span className={styles.badge + " " + styles.badgeBlue}>{campaign.token_symbol}</span>
                  </div>
                  <h3 className={styles.panelTitle} style={{ fontSize: "1.3rem" }}>{campaign.title}</h3>
                  <p className={styles.sectionLead}>{campaign.description}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className={styles.ddGold}>{formatMoney(campaign.price_minor, campaign.currency)}</p>
                  <p className={styles.detailMeta}>Limit: {formatTokenAmount(campaign.total_sale_limit)}</p>
                </div>
              </div>

              <form action={createTokenPackage} className={styles.formGrid}>
                <input name="campaign_id" type="hidden" value={campaign.id} />
                <div className={styles.formGrid3}>
                  <Input name="title" placeholder="Paket adi" required />
                  <Input name="token_amount" placeholder="Token miktari" required />
                  <Input name="price" placeholder="Fiyat" required />
                </div>
                <div className={styles.formGrid3}>
                  <Input name="currency" placeholder={campaign.currency} defaultValue={campaign.currency} />
                  <Input name="max_quantity_per_order" placeholder="Max adet" />
                  <Input name="sort_order" placeholder="Sira" defaultValue="0" />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ad-muted)", fontSize: "0.85rem" }}>
                  <input className="h-4 w-4" style={{ accentColor: "var(--ad-gold)" }} defaultChecked name="active" type="checkbox" />
                  Aktif
                </label>
                <Button type="submit">Paket Ekle</Button>
              </form>

              <div className={styles.grid}>
                {campaign.token_sale_packages.map((pkg) => (
                  <div className={styles.panel} key={pkg.id} style={{ padding: "0.85rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <span className={styles.dd}>{pkg.title}</span>
                    <span className={styles.detailMeta}>
                      {formatTokenAmount(pkg.token_amount)} {campaign.token_symbol} · {formatMoney(pkg.price_minor, pkg.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
