export const REFERRAL_PUBLIC_BASE_URL = "https://iohcoin.com";

export function buildReferralLink(code: string, baseUrl = REFERRAL_PUBLIC_BASE_URL) {
  const url = new URL("/sign-up", baseUrl);
  url.searchParams.set("ref", code);
  return url.toString();
}
