"use client";

import { useState } from "react";
import { createVerificationSubmission } from "@/features/verification/actions";
import { VERIFICATION_ALLOWED_BOOK_SLUGS } from "@/features/verification/config";
import styles from "@/features/account/account-scene.module.css";

type Kind = "amazon_purchase" | "amazon_review" | "general_message";

const kindOptions: { label: string; value: Kind }[] = [
  { label: "Amazon Satın Alma", value: "amazon_purchase" },
  { label: "Amazon Yorum", value: "amazon_review" },
  { label: "Genel Mesaj", value: "general_message" }
];

const bookOptions = VERIFICATION_ALLOWED_BOOK_SLUGS.map((slug) => ({
  label: slug === "godcode" ? "GODCODE" : slug === "codewar" ? "CODEWAR" : "SYSGOD",
  value: slug
}));

export function SubmissionForm({ error }: { error?: string }) {
  const [kind, setKind] = useState<Kind>("amazon_purchase");
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <form action={createVerificationSubmission} className={styles.formGrid}>
      <input name="kind" type="hidden" value={kind} />

      {error ? (
        <div className={styles.noticeError}>{error}</div>
      ) : null}

      <div className={styles.sectionHead}>
        <p className={styles.kicker}>TALEP TURU SEC</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {kindOptions.map((opt) => (
          <button
            className={`${styles.tab} ${kind === opt.value ? styles.tabActive : ""}`}
            key={opt.value}
            onClick={(e) => {
              e.preventDefault();
              setKind(opt.value);
              setFileNames([]);
            }}
            style={{ border: "none", background: "none", padding: 0 }}
            type="button"
          >
            <span
              className={styles.badge}
              style={kind === opt.value ? {
                borderColor: "var(--a-gold)",
                color: "#08090d",
                background: "var(--a-gold)"
              } : undefined}
            >
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {kind === "amazon_purchase" || kind === "amazon_review" ? (
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Kitap</span>
          <select defaultValue="" name="book_slug">
            <option value="" disabled>Kitap sec...</option>
            {bookOptions.map((book) => (
              <option key={book.value} value={book.value}>{book.label}</option>
            ))}
          </select>
        </label>
      ) : null}

      <label className={styles.formLabel}>
        <span className={styles.formLabelText}>Baslik / Konu</span>
        <input
          defaultValue=""
          name="title"
          placeholder={kind === "general_message" ? "Konu" : "Baslik"}
          required
          type="text"
        />
      </label>

      {kind === "amazon_purchase" ? (
        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>Amazon Siparis Numarasi</span>
          <input
            defaultValue=""
            name="amazon_order_id"
            placeholder="Orn: 112-1234567-1234567"
            required
            type="text"
          />
        </label>
      ) : null}

      {kind === "amazon_review" ? (
        <>
          <label className={styles.formLabel}>
            <span className={styles.formLabelText}>Amazon Yorum Linki</span>
            <input
              defaultValue=""
              name="amazon_review_url"
              placeholder="https://www.amazon.com/review/..."
              required
              type="url"
            />
          </label>
          <label className={styles.formLabel}>
            <span className={styles.formLabelText}>Amazon Profil Adi (opsiyonel)</span>
            <input
              defaultValue=""
              name="amazon_profile_name"
              placeholder="Amazon profil adiniz"
              type="text"
            />
          </label>
        </>
      ) : null}

      <label className={styles.formLabel}>
        <span className={styles.formLabelText}>
          {kind === "general_message" ? "Mesaj" : "Aciklama / Mesaj"}
        </span>
        <textarea
          defaultValue=""
          name="body"
          placeholder="Detayli aciklama..."
          rows={5}
        />
      </label>

      <div className={styles.formLabel}>
        <span className={styles.formLabelText}>
          {kind === "general_message" ? "Dosya (opsiyonel)" : "Ekran Goruntusu / Dosya"}
          {kind !== "general_message" ? " (zorunlu)" : ""}
        </span>
        <input
          accept="image/jpeg,image/png,image/webp,application/pdf"
          multiple
          name="attachments"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setFileNames(files.map((f) => f.name));
          }}
          required={kind !== "general_message"}
          type="file"
        />
        {fileNames.length > 0 ? (
          <div style={{ marginTop: "0.5rem", display: "grid", gap: "0.25rem" }}>
            {fileNames.map((name, i) => (
              <span key={i} className={styles.detailMeta} style={{ fontSize: "0.78rem" }}>
                {name}
              </span>
            ))}
          </div>
        ) : null}
        <span className={styles.sectionLead} style={{ marginTop: "0.5rem" }}>
          Max 10MB · JPG, PNG, WebP, PDF
        </span>
      </div>

      <button className={styles.btnPrimary} type="submit">
        Gonderiyi Olustur
      </button>
    </form>
  );
}
