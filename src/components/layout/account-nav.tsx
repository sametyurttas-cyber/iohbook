import Link from "next/link";

const accountItems = [
  { href: "/account/orders", label: "Siparislerim" },
  { href: "/account/downloads", label: "Indirmelerim" },
  { href: "/account/nft-collection", label: "NFT Koleksiyonum" },
  { href: "/account/token-allocations", label: "Token Haklarim" },
  { href: "/account/wallets", label: "Cuzdanlarim" },
  { href: "/account/addresses", label: "Adreslerim" },
  { href: "/account/profile", label: "Profilim" }
];

export function AccountNav() {
  return (
    <nav aria-label="Account navigation" className="flex flex-wrap gap-2">
      {accountItems.map((item) => (
        <Link
          className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
