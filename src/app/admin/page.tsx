export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10" id="main-content">
      <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <p className="text-eyebrow uppercase text-muted-foreground">Protected</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">
          Admin dashboard shell
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Bu alan sadece aktif staff rolü olan kullanıcılar içindir. Ürün,
          sipariş, stok ve içerik modülleri sonraki promptlarda eklenecek.
        </p>
      </div>
    </main>
  );
}
