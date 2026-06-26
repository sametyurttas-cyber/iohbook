import { describe, expect, it } from "vitest";
import { buildReferralLink } from "@/features/referrals/link";

describe("referral link", () => {
  it("builds the public referral signup link", () => {
    expect(buildReferralLink("IOHABC123")).toBe("https://iohcoin.com/sign-up?ref=IOHABC123");
  });
});
