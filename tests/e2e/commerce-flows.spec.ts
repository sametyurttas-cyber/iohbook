import { expect, test } from "@playwright/test";

test("guest checkout edge-case shows an empty cart guard", async ({ page }) => {
  await page.goto("/checkout");

  await expect(page.getByRole("heading", { name: "Secure checkout" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse books" })).toHaveAttribute("href", "/books");
});

test("member login happy-path renders credential form and recovery link", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: "Giris yap" })).toBeVisible();
  await expect(page.getByPlaceholder("E-posta")).toBeVisible();
  await expect(page.getByPlaceholder("Sifre")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sifremi unuttum" })).toHaveAttribute(
    "href",
    "/forgot-password"
  );
});

test("admin order update flow is protected for anonymous users", async ({ page }) => {
  await page.goto("/admin/orders");

  await expect(page).toHaveURL(/\/sign-in\?next=(%2Fadmin|\/admin)/);
  await expect(page.getByRole("heading", { name: "Giris yap" })).toBeVisible();
});

test("seeded admin can open an order detail drawer before updating status", async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Requires seeded Supabase staff user and order data."
  );

  await page.goto("/sign-in?next=/admin/orders");
  await page.getByPlaceholder("E-posta").fill(process.env.E2E_ADMIN_EMAIL ?? "");
  await page.getByPlaceholder("Sifre").fill(process.env.E2E_ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Giris Yap" }).click();
  await expect(page).toHaveURL(/\/admin\/orders/);
  await expect(page.getByRole("button", { name: "Detay" })).toBeVisible();
});
