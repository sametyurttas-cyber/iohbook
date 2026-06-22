import type { Metadata } from "next";
import { CartScene } from "@/features/cart/cart-scene";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH Universe sepetiniz — secilen dijital kitaplar odeme sonrasi hesabiniza eklenir ve PDF/EPUB olarak erisilebilir hale gelir.",
  path: "/cart",
  title: "Sepet"
});

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
