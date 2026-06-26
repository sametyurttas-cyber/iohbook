import type { Metadata } from "next";
import { CheckoutScene } from "@/features/checkout/checkout-scene";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Checkout",
  "IOH siparis odeme ve teslimat akisi."
);

type CheckoutPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  return <CheckoutScene searchParams={searchParams} />;
}