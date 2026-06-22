"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createVerificationSubmission } from "@/features/verification/actions";
import { VERIFICATION_ALLOWED_BOOK_SLUGS } from "@/features/verification/config";
import styles from "@/features/account/account-scene.module.css";

type Kind = "amazon_purchase" | "amazon_review" | "general_message";

const kindOptions: {
  description: string;
  label: string;
  value: Kind;
}[] = [
  {
    description: "Amazon kitap siparisini dogrula ve onaydan sonra IOH puanini al.",
    label: "Amazon Satin Alma",
    value: "amazon_purchase"
  },
  {
    description: "Yayinlanan Amazon yorumunu kitap ve profil bilgisiyle gonder.",
    label: "Amazon Yorum",
    value: "amazon_review"
  },
  {
    description: "Destek, hesap veya IOH Universe hakkinda dogrudan mesaj yaz.",
    label: "Genel Mesaj",
    value: "general_message"
  }
];

const bookOptions = VERIFICATION_ALLOWED_BOOK_SLUGS.map((slug) => ({
  label: slug === "godcode" ? "GODCODE" : slug === "codewar" ? "CODEWAR" : "SYSGOD",
  value: slug
}));

function SubmissionButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={styles.btnPrimary}
      disabled={!ready || pending}
      type="submit"
    >
      {pending ? "Gonderiliyor..." : "Gonderiyi Olustur"}
    </button>
  );
}

export function SubmissionForm({
  error,
  requestId
}: {
  error?: string;
  requestId: string;
}) {
  const [kind, setKind] = useState<Kind>("amazon_purchase");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const activeKind = kindOptions.find((option) => option.value === kind)!;

  return (
    <form action={createVerificationSubmission} className={styles.verificationForm}>
      <input name="kind" type="hidden" value={kind} />
      <input name="request_id" type="hidden" value={requestId} />

      {error ? <div className={styles.noticeError}>{error}</div> : null}

      <fieldset className={styles.kindFieldset}>
        <legend className={styles.formLegend}>Talep turu</legend>
        <div className={styles.kindGrid}>
          {kindOptions.map((option, index) => (
            <button
              aria-pressed={kind === option.value}
              className={`${styles.kindOption} ${
                kind === option.value ? styles.kindOptionActive : ""
              }`}
              key={option.value}
              onClick={() => {
                setKind(option.value);
                setFileNames([]);
              }}
              type="button"
            >
              <span className={styles.kindIndex}>0{index + 1}</span>
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.formModeIntro}>
        <span className={styles.badge}>{activeKind.label}</span>
        <p>{activeKind.description}</p>
      </div>

      <div className={styles.formGrid} key={kind}>
        {kind === "amazon_purchase" || kind === "amazon_review" ? (
          <label className={styles.formLabel}>
            <span className={styles.formLabelText}>Kitap</span>
            <select defaultValue="" name="book_slug" required>
              <option value="" disabled>Kitap sec...</option>
              {bookOptions.map((book) => (
                <option key={book.value} value={book.value}>{book.label}</option>
              ))}
            </select>
          </label>
        ) : null}

        <label className={styles.formLabel}>
          <span className={styles.formLabelText}>
            {kind === "general_message" ? "Konu" : "Baslik"}
          </span>
          <input
            name="title"
            placeholder={
              kind === "amazon_purchase"
                ? "Orn: GODCODE satin alma dogrulamasi"
                : kind === "amazon_review"
                  ? "Orn: GODCODE Amazon yorumu"
                  : "Mesajinizin konusu"
            }
            required
            type="text"
          />
        </label>

        {kind === "amazon_purchase" ? (
          <label className={`${styles.formLabel} ${styles.formWide}`}>
            <span className={styles.formLabelText}>Amazon Siparis Numarasi</span>
            <input
              name="amazon_order_id"
              placeholder="Orn: 112-1234567-1234567"
              required
              type="text"
            />
          </label>
        ) : null}

        {kind === "amazon_review" ? (
          <>
            <label className={`${styles.formLabel} ${styles.formWide}`}>
              <span className={styles.formLabelText}>Amazon Yorum Linki</span>
              <input
                name="amazon_review_url"
                placeholder="https://www.amazon.com/review/..."
                required
                type="url"
              />
            </label>
            <label className={`${styles.formLabel} ${styles.formWide}`}>
              <span className={styles.formLabelText}>Amazon Profil Adi (opsiyonel)</span>
              <input
                name="amazon_profile_name"
                placeholder="Amazon profil adiniz"
                type="text"
              />
            </label>
          </>
        ) : null}

        <label className={`${styles.formLabel} ${styles.formWide}`}>
          <span className={styles.formLabelText}>
            {kind === "general_message" ? "Mesaj" : "Aciklama / Not"}
          </span>
          <textarea
            name="body"
            placeholder={
              kind === "general_message"
                ? "Destek ekibine iletmek istediginiz mesaji yazin..."
                : "Dogrulama hakkinda eklemek istediginiz bilgiler..."
            }
            required={kind === "general_message"}
            rows={6}
          />
        </label>

        <label className={`${styles.formLabel} ${styles.formWide}`}>
          <span className={styles.formLabelText}>
            {kind === "general_message" ? "Dosya (opsiyonel)" : "Kanıt dosyasi (zorunlu)"}
          </span>
          <input
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className={styles.fileInput}
            multiple
            name="attachments"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setFileNames(files.map((file) => file.name));
            }}
            required={kind !== "general_message"}
            type="file"
          />
          <span className={styles.formHint}>En fazla 10MB - JPG, PNG, WebP veya PDF</span>
          {fileNames.length > 0 ? (
            <div className={styles.fileList}>
              {fileNames.map((name) => <span key={name}>{name}</span>)}
            </div>
          ) : null}
        </label>
      </div>

      <div className={styles.formFooter}>
        <p>Gonderi yalnizca bir kez olusturulur. Islem surerken sayfayi kapatmayin.</p>
        <SubmissionButton ready={Boolean(requestId)} />
      </div>
    </form>
  );
}
