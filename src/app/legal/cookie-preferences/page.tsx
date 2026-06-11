import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/features/legal/legal-content";

const document = legalDocuments["cookie-preferences"];

export const metadata: Metadata = {
  description: document.description,
  title: document.title
};

export default function CookiePreferencesPage() {
  return <LegalPage document={document} showCookiePreferences />;
}
