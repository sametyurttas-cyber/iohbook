import { AdminMediaUploadForm } from "@/features/media/admin-media-upload-form";

export default function AdminMediaPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.8fr_1.2fr]" id="main-content">
      <section className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <p className="text-eyebrow uppercase text-muted-foreground">Media</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">
          Admin media uploads
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Kapak, galeri ve banner gorselleri public-media bucket alanina yuklenir
          ve product_media metadata kaydi olusturur. Urun admin ekrani henuz
          eklenmedigi icin bu gecici yuzey product id degerini manuel alir.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <AdminMediaUploadForm />
      </section>
    </main>
  );
}
