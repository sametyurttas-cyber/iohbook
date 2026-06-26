"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount, multiplyTokenDecimal, calculateTotalTokenAmount } from "@/features/token-sale/utils";
import { startTokenSalePayment } from "@/features/token-sale/actions";
import type { TokenCampaignWithPackages } from "@/features/token-sale/queries";
import styles from "./token-sale-scene.module.css";

interface PackageCardClientProps {
  campaign: TokenCampaignWithPackages;
  index: number;
  pkg: TokenCampaignWithPackages["token_sale_packages"][number];
  defaultQuantity?: number;
}

export function PackageCardClient({ campaign, index, pkg, defaultQuantity }: PackageCardClientProps) {
  const maxLimit = pkg.max_quantity_per_order ?? 30;
  const initialQty = Math.max(1, Math.min(defaultQuantity ?? 1, maxLimit));
  const [quantity, setQuantity] = useState<number>(initialQty);
  const [manualText, setManualText] = useState<string>(String(initialQty));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setQuantity(val);
      setManualText(String(val));
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setManualText(text);

    const val = parseInt(text, 10);
    if (!isNaN(val)) {
      if (val > maxLimit) {
        setQuantity(maxLimit);
        setManualText(String(maxLimit));
      } else if (val >= 1) {
        setQuantity(val);
      }
    }
  };

  const handleManualInputBlur = () => {
    const val = parseInt(manualText, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
      setManualText("1");
    } else if (val > maxLimit) {
      setQuantity(maxLimit);
      setManualText(String(maxLimit));
    } else {
      setQuantity(val);
      setManualText(String(val));
    }
  };

  const totalPrice = pkg.price_minor * quantity;
  const baseTokens = multiplyTokenDecimal(pkg.token_amount, quantity);
  const totalTokens = calculateTotalTokenAmount(baseTokens, campaign.bonus_bps);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await startTokenSalePayment(formData);

        if (result?.paymentUrl) {
          // Open Shopier in a new tab
          window.open(result.paymentUrl, "_blank", "noopener,noreferrer");

          // Navigate current tab to pending page
          const pendingUrl = `/payment/pending${result.orderNumber ? `?order=${encodeURIComponent(result.orderNumber)}` : ""}`;
          router.push(pendingUrl);
        }
      } catch {
        // Server action redirects (validation errors) throw NEXT_REDIRECT
        // which is caught and handled by Next.js automatically
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.packageCard}>
      <input name="package_id" type="hidden" value={pkg.id} />
      <div className={styles.packageTop}>
        <span className={styles.packageNumber}>/ {String(index + 1).padStart(2, "0")}</span>
        <span className={styles.packageAmount}>
          Birim: {formatTokenAmount(pkg.token_amount)} {campaign.token_symbol}
        </span>
      </div>
      <h3 className={styles.packageTitle}>{pkg.title}</h3>
      <div className={styles.priceContainer}>
        <p className={`${styles.packagePrice} ts-total-price`}>
          {formatMoney(totalPrice, pkg.currency)}
        </p>
        <span className={`${styles.packageTokens} ts-total-tokens`}>
          {formatTokenAmount(totalTokens)} {campaign.token_symbol}
        </span>
      </div>

      <div className={styles.orbitContainer}>
        <div className={styles.orbitTrack} />
        <div className={styles.orbitRow}>
          <input
            className={styles.orbitSlider}
            value={quantity}
            onChange={handleSliderChange}
            max={maxLimit}
            min={1}
            type="range"
          />
          <input
            className={styles.orbitManualInput}
            value={manualText}
            onChange={handleManualInputChange}
            onBlur={handleManualInputBlur}
            max={maxLimit}
            min={1}
            name="quantity"
            type="number"
            required
            autoComplete="off"
          />
        </div>
        <div className={styles.orbitTelemetry}>
          <span>Seçilen Miktar: <strong className="ts-qty-val">{quantity}</strong> Adet</span>
          {campaign.bonus_bps > 0 ? (
            <span>Bonus: +%{campaign.bonus_bps / 100}</span>
          ) : null}
        </div>
      </div>

      <label className={styles.termsLabel}>
        <input
          className={styles.termsCheckbox}
          name="token_sale_terms"
          required
          type="checkbox"
        />
        <span>
          Token haklarinin odeme sonrasi allocation olarak acilacagini, otomatik
          transfer yapilmayacagini ve satin alma icin wallet baglama zorunlulugu
          olmadigini kabul ediyorum.
        </span>
      </label>
      <button className={styles.submitButton} disabled={isPending} type="submit">
        {isPending ? "İşleniyor..." : "Shopier ile odeme yap"}
      </button>
    </form>
  );
}

