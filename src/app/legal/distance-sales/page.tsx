import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/features/legal/legal-content";

const document = legalDocuments["distance-sales"];

export const metadata: Metadata = {
  description: document.description,
  title: document.title
};

export default function DistanceSalesPage() {
  return <LegalPage document={document} />;
}
