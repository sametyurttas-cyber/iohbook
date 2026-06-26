import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin referral navigation", () => {
  it("limits the admin referral nav link to owner, admin_ops and support", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/admin/layout.tsx"), "utf8");

    expect(layout).toContain('href: "/admin/referrals"');
    expect(layout).toContain('allowedRoles: ["owner", "admin_ops", "support"]');
  });
});
