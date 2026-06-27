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
    <p>Hello ${data.customerName ?? "IOH reader"},</p>
    <p>Here is the summary for your order <strong style="color:#f6f0e8;">${data.orderNumber}</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
      ${orderLines(data.lines, data.currency)}
      <tr>
        <td style="padding:14px 0;color:#f6f0e8;"><strong>Total</strong></td>
        <td align="right" style="padding:14px 0;color:#c9a75d;"><strong>${formatMoney(data.totalMinor, data.currency)}</strong></td>
      </tr>
    </table>
    <p><a href="${data.orderUrl}" style="${IOH_EMAIL_BUTTON_STYLE}">View order</a></p>`;
}

export function renderOrderReceivedEmail(data: OrderEmailData) {
  const fulfillmentMode = getFulfillmentMode(data.lines);
  const digitalNotice =
    fulfillmentMode === "digital"
      ? "<p>This order contains a digital book. Once payment is verified, no file attachment will be sent; your secure download access will be opened in your account.</p>"
      : fulfillmentMode === "hybrid"
        ? "<p>This order contains both digital and physical delivery. Digital files are delivered through your account; physical items will follow the operations process.</p>"
        : "<p>When payment verification is complete, your physical order will move into preparation.</p>";

  return {
    html: shell({
      body: `${orderSummary(data)}${digitalNotice}<p>We will notify you again when payment verification is complete.</p>`,
      preview: `Your order ${data.orderNumber} has been received.`,
      title: "Order received"
    }),
    subject: `Order received: ${data.orderNumber}`,
    text: `Order received: ${data.orderNumber}\nTotal: ${formatMoney(data.totalMinor, data.currency)}\n${data.orderUrl}`
  };
}

export function renderPaymentConfirmedEmail(data: OrderEmailData) {
  const fulfillmentMode = getFulfillmentMode(data.lines);
  const downloadsLink = data.downloadsUrl
    ? `<p><a href="${data.downloadsUrl}" style="${IOH_EMAIL_BUTTON_STYLE}">Open downloads</a></p>`
    : "";
  const digitalBody =
    fulfillmentMode === "digital"
      ? `<p>Your book is ready. PDF/EPUB files are not sent as email attachments and no permanent public link is created. Sign in and open Downloads to access your files securely.</p>${downloadsLink}`
      : fulfillmentMode === "hybrid"
        ? `<p>Your payment has been confirmed. Digital items are available from Downloads in your account; physical items will move into preparation and delivery separately.</p>${downloadsLink}`
        : "<p>Your payment has been confirmed through backend verification. Your physical order will move into preparation.</p>";

  return {
    html: shell({
      body: `${orderSummary(data)}${digitalBody}`,
      preview: `${data.orderNumber} payment has been confirmed.`,
      title: fulfillmentMode === "digital" ? "Your book is ready" : "Payment confirmed"
    }),
    subject: `Payment confirmed: ${data.orderNumber}`,
    text:
      fulfillmentMode === "physical"
        ? `Payment confirmed: ${data.orderNumber}\n${data.orderUrl}`
        : `Payment confirmed: ${data.orderNumber}\nNo file attachments are sent. Sign in to download: ${data.downloadsUrl ?? data.orderUrl}`
  };
}

export function renderOrderShippedEmail(data: OrderEmailData) {
  const tracking = data.trackingUrl
    ? `<p><a href="${data.trackingUrl}" style="color:#c9a75d;">Open tracking</a></p>`
    : data.trackingNumber
      ? `<p>Tracking number: <strong style="color:#f6f0e8;">${data.trackingNumber}</strong></p>`
      : "<p>Tracking information has not been added yet.</p>";

  return {
    html: shell({
      body: `${orderSummary(data)}<p>Your order has been shipped.</p>${tracking}`,
      preview: `${data.orderNumber} has shipped.`,
      title: "Your order has shipped"
    }),
    subject: `Your order has shipped: ${data.orderNumber}`,
    text: `Your order has shipped: ${data.orderNumber}\nTracking: ${data.trackingUrl ?? data.trackingNumber ?? "-"}`
  };
}

export function renderPasswordResetEmail(input: { email: string; resetUrl: string }) {
  return {
    html: shell({
      body: `<p>We received a password reset request for ${input.email}.</p><p><a href="${input.resetUrl}" style="${IOH_EMAIL_BUTTON_STYLE}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      preview: "Your IOH Book password reset link.",
      title: "Password reset"
    }),
    subject: "IOH Book password reset",
    text: `Password reset link: ${input.resetUrl}`
  };
}

export function renderSecurityNoticeEmail(input: { email: string; message: string }) {
  return {
    html: shell({
      body: `<p>Security notice for ${input.email}:</p><p>${input.message}</p><p>If you did not perform this action, please change your password.</p>`,
      preview: "IOH Book account security notice.",
      title: "Account security"
    }),
    subject: "IOH Book account security notice",
    text: `Account security notice: ${input.message}`
  };
}
