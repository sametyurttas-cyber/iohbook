import Link from "next/link";
import styles from "@/features/account/account-scene.module.css";

const accountItems = [
  { href: "/account/orders", label: "Siparislerim" },
  { href: "/account/downloads", label: "Indirmelerim" },
  { href: "/account/rewards", label: "Odullerim" },
  { href: "/account/nft-collection", label: "NFT Koleksiyonum" },
  { href: "/account/token-allocations", label: "Token Haklarim" },
  { href: "/account/wallets", label: "Cuzdanlarim" },
  { href: "/account/addresses", label: "Adreslerim" },
  { href: "/account/profile", label: "Profilim" }
];

export function AccountNav({ activePath }: { activePath: string }) {
  return (
    <nav aria-label="Hesap navigasyonu" className={styles.tabs}>
      <div className={`${styles.shell} ${styles.tabsInner}`}>
        {accountItems.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);

          return (
            <Link
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
