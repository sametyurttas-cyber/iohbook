import { cookies } from "next/headers";

export const CART_COOKIE_NAME = "ioh_cart_id";

export async function getOrCreateAnonymousCartId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const cartId = crypto.randomUUID();
  cookieStore.set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return cartId;
}

export async function getAnonymousCartId() {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
}
