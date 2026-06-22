import Link from "next/link";
import { listSubmissionsForAdmin } from "@/features/verification/admin-queries";
import { isVerificationSchemaUnavailableError } from "@/features/verification/errors";
import type { AdminSubmissionListItem } from "@/features/verification/admin-queries";
import { SUBMISSION_KIND_LABELS, SUBMISSION_STATUS_LABELS } from "@/features/verification/labels";
import { formatDateTime } from "@/features/account/account-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styles from "@/features/admin/admin-scene.module.css";

type AdminVerificationsPageProps = {
  searchParams?: Promise<{
    kind?: string;
    status?: string;
    book_slug?: string;
    q?: string;
  }>;
};

const statusFilters = [
  { label: "Tumu", value: "all" },
  { label: "Bekleyen", value: "pending" },
  { label: "Inceleniyor", value: "under_review" },
  { label: "Onaylanan", value: "approved" },
  { label: "Reddedilen", value: "rejected" },
  { label: "Yanitlanan", value: "responded" },
  { label: "Kapali", value: "closed" }
];

const kindFilters = [
  { label: "Tumu", value: "all" },
  { label: "Satin Alma", value: "amazon_purchase" },
  { label: "Yorum", value: "amazon_review" },
  { label: "Mesaj", value: "general_message" }
];

const bookFilters = [
  { label: "Tumu", value: "all" },
  { label: "GODCODE", value: "godcode" },
  { label: "CODEWAR", value: "codewar" },
  { label: "SYSGOD", value: "sysgod" }
];

function badgeClassForStatus(status: string) {
  if (status === "approved") return styles.badgeGold;
  if (status === "rejected") return styles.badgeRed;
  if (status === "responded" || status === "under_review") return styles.badgeBlue;
  return "";
}

function badgeClassForKind(kind: string) {
  if (kind === "amazon_purchase") return styles.badgeGold;
  if (kind === "amazon_review") return styles.badgeBlue;
  return "";
}

export default async function AdminVerificationsPage({ searchParams }: AdminVerificationsPageProps) {
  const params = await searchParams;
  let submissions: AdminSubmissionListItem[] = [];
  let setupRequired = false;

  try {
    submissions = await listSubmissionsForAdmin({
      bookSlug: params?.book_slug,
      kind: params?.kind,
      q: params?.q,
      status: params?.status
    });
  } catch (error) {
    if (!isVerificationSchemaUnavailableError(error)) {
      throw error;
    }

    setupRequired = true;
  }

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">VERIFY</div>
            <p className={styles.kicker}>09 / DOGRULAMA MERKEZI</p>
            <h2 className={styles.heroTitle}>Dogrulamalar</h2>
            <p className={styles.heroLead}>
              Amazon satin alim ve yorum dogrulamalari, genel mesajlar. Ekran goruntulerini
              incele, yanit yaz, reddet veya kapat.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>Toplam <b>{submissions.length}</b> talep</span>
          </div>
        </div>
      </section>

      <form className={styles.filters}>
        <Input
          defaultValue={params?.q ?? ""}
          name="q"
          placeholder="E-posta, baslik veya siparis no ara"
        />
        <select defaultValue={params?.status ?? "all"} name="status">
          {statusFilters.map((f) => (
            <option key={f.value} value={f.value}>Durum: {f.label}</option>
          ))}
        </select>
        <select defaultValue={params?.kind ?? "all"} name="kind">
          {kindFilters.map((f) => (
            <option key={f.value} value={f.value}>Tur: {f.label}</option>
          ))}
        </select>
        <select defaultValue={params?.book_slug ?? "all"} name="book_slug">
          {bookFilters.map((f) => (
            <option key={f.value} value={f.value}>Kitap: {f.label}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary">Filtrele</Button>
      </form>

      {setupRequired ? (
        <div className={styles.noticeError} style={{ marginBottom: "1.25rem" }}>
          Dogrulama modulu migrationlari Supabase veritabanina uygulanmamis. Tablolar
          olusturuldugunda bu ekran otomatik olarak aktif olacak.
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Kullanici</TableHead>
              <TableHead>Tur</TableHead>
              <TableHead>Kitap</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Odul</TableHead>
              <TableHead>Ek</TableHead>
              <TableHead>Yanit</TableHead>
              <TableHead className="text-right">Aksiyon</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!setupRequired && submissions.length === 0 ? (
              <TableRow>
                <TableCell className="py-10 text-center text-muted-foreground" colSpan={9}>
                  Filtrelere uygun talep bulunamadi.
                </TableCell>
              </TableRow>
            ) : null}

            {submissions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(s.created_at)}
                </TableCell>
                <TableCell>
                  <div className="grid gap-1">
                    <span className="text-paper">{s.profile?.full_name ?? "Isimsiz"}</span>
                    <span className="text-xs text-muted-foreground">{s.profile?.email ?? "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`${styles.badge} ${badgeClassForKind(s.kind)}`}>
                    {SUBMISSION_KIND_LABELS[s.kind]}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.book_slug ?? "-"}
                </TableCell>
                <TableCell>
                  <span className={`${styles.badge} ${badgeClassForStatus(s.status)}`}>
                    {SUBMISSION_STATUS_LABELS[s.status]}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {s.reward_amount > 0 ? (
                    <span className="text-gold">{s.reward_amount}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {s.attachment_count > 0 ? (
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>
                      {s.attachment_count} dosya
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.reply_count > 0 ? `${s.reply_count} yanit` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/verifications/${s.id}`}>Incele</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
