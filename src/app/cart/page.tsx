import type { Metadata } from "next";
import { CartScene } from "@/features/cart/cart-scene";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Sepet", "IOH Universe sepetiniz.");

type CartPageProps = {
  searchParams?: Promise<{
    added?: string;
    error?: string;
    cleared?: string;
    removed?: string;
    updated?: string;
  }>;
};

export default function CartPage({ searchParams }: CartPageProps) {
  return <CartScene searchParams={searchParams} />;
}
