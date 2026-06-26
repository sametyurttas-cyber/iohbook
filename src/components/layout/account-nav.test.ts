import { describe, expect, it } from "vitest";
import { accountItems } from "@/components/layout/account-nav";

describe("account nav", () => {
  it("contains the referrals page link", () => {
    expect(accountItems).toContainEqual({
      href: "/account/referrals",
      label: "Davetlerim"
    });
  });
});
