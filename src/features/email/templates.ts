import { formatMoney } from "@/features/products/product-utils";
import { IOH_EMAIL_BUTTON_STYLE, renderIohEmailShell } from "@/features/email/email-shell";

export type OrderEmailLine = {
  fulfillmentType: "physical" | "digital" | "claimable" | "hybrid" | string;
  quantity: number;
  title: string;
  totalMinor: number;
  variantTitle: string;
};

export type OrderEmailData = {
  customerName: string | null;
  lines: OrderEmailLine[];
  orderNumber: string;
  orderUrl: string;
  downloadsUrl?: string;
  totalMinor: number;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  currency: string;
};

function getFulfillmentMode(lines: OrderEmailLine[]) {
  const hasDigital = lines.some(
    (line) => line.fulfillmentType === "digital" || line.fulfillmentType === "hybrid"
  );
  const hasPhysical = lines.some(
    (line) => line.fulfillmentType === "physical" || line.fulfillmentType === "hybrid"
  );

  if (hasDigital && hasPhysical) {
    return "hybrid";
  }

  if (hasDigital) {
    return "digital";
  }

  return "physical";
}

function shell(input: { body: string; preview: string; title: string }) {
  return renderIohEmailShell(input);
}

function orderLines(lines: OrderEmailLine[], currency: string) {
  return lines
    .map(
      (line) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a2826;">
            <strong style="color:#f6f0e8;">${line.title}</strong><br />
            <span style="color:#8f8780;">${line.variantTitle} x ${line.quantity}</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #2a2826;color:#c9a75d;">
            ${formatMoney(line.totalMinor, currency)}
          </td>
        </tr>`
    )
    .join("");
}

function orderSummary(data: OrderEmailData) {
  return `
    <p>Merhaba ${data.customerName ?? "IOH okuru"},</p>
    <p><strong style="color:#f6f0e8;">${data.orderNumber}</strong> numarali siparisinizin ozeti asagidadir.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
      ${orderLines(data.lines, data.currency)}
      <tr>
        <td style="padding:14px 0;color:#f6f0e8;"><strong>Toplam</strong></td>
        <td align="right" style="padding:14px 0;color:#c9a75d;"><strong>${formatMoney(data.totalMinor, data.currency)}</strong></td>
      </tr>
    </table>
    <p><a href="${data.orderUrl}" style="${IOH_EMAIL_BUTTON_STYLE}">Siparisi goruntule</a></p>`;
}

export function renderOrderReceivedEmail(data: OrderEmailData) {
  const fulfillmentMode = getFulfillmentMode(data.lines);
  const digitalNotice =
    fulfillmentMode === "digital"
      ? "<p>Bu siparis dijital kitap iceriyor. Odeme dogrulandiginda dosya eki gonderilmeyecek; guvenli indirme hakkiniz hesabinizda acilacak.</p>"
      : fulfillmentMode === "hybrid"
        ? "<p>Bu sipariste dijital ve fiziksel teslimat bir arada bulunuyor. Dijital dosyalar hesabinizdan, fiziksel kalemler operasyon sureciyle teslim edilir.</p>"
        : "<p>Odeme dogrulamasi tamamlandiginda fiziksel siparisiniz hazirlik surecine alinacaktir.</p>";

  return {
    html: shell({
      body: `${orderSummary(data)}${digitalNotice}<p>Odeme dogrulamasi tamamlandiginda sizi ayrica bilgilendirecegiz.</p>`,
      preview: `${data.orderNumber} numarali siparisiniz alindi.`,
      title: "Siparisiniz alindi"
    }),
    subject: `Siparisiniz alindi: ${data.orderNumber}`,
    text: `Siparisiniz alindi: ${data.orderNumber}\nToplam: ${formatMoney(data.totalMinor, data.currency)}\n${data.orderUrl}`
  };
}

export function renderPaymentConfirmedEmail(data: OrderEmailData) {
  const fulfillmentMode = getFulfillmentMode(data.lines);
  const downloadsLink = data.downloadsUrl
    ? `<p><a href="${data.downloadsUrl}" style="${IOH_EMAIL_BUTTON_STYLE}">Indirmelerimi ac</a></p>`
    : "";
  const digitalBody =
    fulfillmentMode === "digital"
      ? `<p>Kitabiniz hazir. PDF/EPUB dosyasi mail eki olarak gonderilmez ve kalici public link olusturulmaz. Indirmek icin hesabinizla giris yapip Indirmelerim sayfasini acin.</p>${downloadsLink}`
      : fulfillmentMode === "hybrid"
        ? `<p>Odemeniz onaylandi. Dijital kalemler icin hesabinizdaki Indirmelerim sayfasini kullanabilirsiniz; fiziksel kalemler ayrica hazirlik/teslimat surecine alinacaktir.</p>${downloadsLink}`
        : "<p>Odemeniz backend dogrulamasi ile onaylandi. Fiziksel siparisiniz hazirlik asamasina alinacak.</p>";

  return {
    html: shell({
      body: `${orderSummary(data)}${digitalBody}`,
      preview: `${data.orderNumber} odemesi onaylandi.`,
      title: fulfillmentMode === "digital" ? "Kitabiniz hazir" : "Odemeniz onaylandi"
    }),
    subject: `Odemeniz onaylandi: ${data.orderNumber}`,
    text:
      fulfillmentMode === "physical"
        ? `Odemeniz onaylandi: ${data.orderNumber}\n${data.orderUrl}`
        : `Odemeniz onaylandi: ${data.orderNumber}\nDosya eki yoktur. Indirmek icin giris yapin: ${data.downloadsUrl ?? data.orderUrl}`
  };
}

export function renderOrderShippedEmail(data: OrderEmailData) {
  const tracking = data.trackingUrl
    ? `<p><a href="${data.trackingUrl}" style="color:#c9a75d;">Kargo takibini ac</a></p>`
    : data.trackingNumber
      ? `<p>Kargo takip kodu: <strong style="color:#f6f0e8;">${data.trackingNumber}</strong></p>`
      : "<p>Kargo takip bilgisi henuz girilmedi.</p>";

  return {
    html: shell({
      body: `${orderSummary(data)}<p>Siparisiniz kargoya verildi.</p>${tracking}`,
      preview: `${data.orderNumber} kargoya verildi.`,
      title: "Siparisiniz kargoda"
    }),
    subject: `Siparisiniz kargoya verildi: ${data.orderNumber}`,
    text: `Siparisiniz kargoya verildi: ${data.orderNumber}\nTakip: ${data.trackingUrl ?? data.trackingNumber ?? "-"}`
  };
}

export function renderPasswordResetEmail(input: { email: string; resetUrl: string }) {
  return {
    html: shell({
      body: `<p>${input.email} hesabi icin sifre sifirlama talebi aldik.</p><p><a href="${input.resetUrl}" style="${IOH_EMAIL_BUTTON_STYLE}">Sifremi sifirla</a></p><p>Bu talebi siz yapmadiysaniz bu e-postayi yok sayabilirsiniz.</p>`,
      preview: "IOH Book sifre sifirlama baglantiniz.",
      title: "Sifre sifirlama"
    }),
    subject: "IOH Book sifre sifirlama",
    text: `Sifre sifirlama baglantisi: ${input.resetUrl}`
  };
}

export function renderSecurityNoticeEmail(input: { email: string; message: string }) {
  return {
    html: shell({
      body: `<p>${input.email} hesabi icin guvenlik bildirimi:</p><p>${input.message}</p><p>Bu islemi siz yapmadiysaniz lutfen sifrenizi degistirin.</p>`,
      preview: "IOH Book hesap guvenligi bildirimi.",
      title: "Hesap guvenligi"
    }),
    subject: "IOH Book hesap guvenligi bildirimi",
    text: `Hesap guvenligi bildirimi: ${input.message}`
  };
}
