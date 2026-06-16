import { describe, expect, it } from "vitest";
import {
  renderOrderReceivedEmail,
  renderPaymentConfirmedEmail,
  type OrderEmailData
} from "@/features/email/templates";

function buildOrderEmailData(
  fulfillmentType: "physical" | "digital" | "hybrid" = "digital"
): OrderEmailData {
  return {
    currency: "TRY",
    customerName: "Samet",
    downloadsUrl: "https://ioh.example/account/downloads",
    lines: [
      {
        fulfillmentType,
        quantity: 1,
        title: "GODCODE",
        totalMinor: 45000,
        variantTitle: fulfillmentType === "physical" ? "Standart baski" : "PDF"
      }
    ],
    orderNumber: "IOH-1",
    orderUrl: "https://ioh.example/account/orders/order-id",
    totalMinor: 45000
  };
}

describe("order email templates", () => {
  it("renders digital payment confirmation with downloads link and no attachment payload", () => {
    const email = renderPaymentConfirmedEmail(buildOrderEmailData("digital"));

    expect(email.subject).toBe("Odemeniz onaylandi: IOH-1");
    expect(email.html).toContain("Kitabiniz hazir");
    expect(email.html).toContain("https://ioh.example/account/downloads");
    expect(email.html).toContain("PDF/EPUB dosyasi mail eki olarak gonderilmez");
    expect(email.text).toContain("Dosya eki yoktur");
    expect(email).not.toHaveProperty("attachments");
  });

  it("keeps physical payment confirmation copy separate from digital delivery", () => {
    const email = renderPaymentConfirmedEmail(buildOrderEmailData("physical"));

    expect(email.html).toContain("Fiziksel siparisiniz hazirlik asamasina alinacak");
    expect(email.html).not.toContain("Indirmelerimi ac");
    expect(email.text).not.toContain("Dosya eki yoktur");
  });

  it("mentions digital delivery in order received email before payment is confirmed", () => {
    const email = renderOrderReceivedEmail(buildOrderEmailData("digital"));

    expect(email.html).toContain("dosya eki gonderilmeyecek");
    expect(email.html).toContain("guvenli indirme hakkiniz hesabinizda acilacak");
  });
}
