import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("verification navigation and routes", () => {
  it("exposes the account rewards link and all customer routes", () => {
    const accountNav = readFileSync(resolve("src/components/layout/account-nav.tsx"), "utf8");

    expect(accountNav).toContain('href: "/account/rewards"');
    expect(accountNav).toMatch(/label: "(Odullerim|Ödüllerim)"/);
    expect(existsSync(resolve("src/app/account/rewards/page.tsx"))).toBe(true);
    expect(existsSync(resolve("src/app/account/rewards/new/page.tsx"))).toBe(true);
    expect(existsSync(resolve("src/app/account/rewards/[submissionId]/page.tsx"))).toBe(true);
  });

  it("limits the admin verification nav link to owner, admin_ops and support", () => {
    const adminLayout = readFileSync(resolve("src/app/admin/layout.tsx"), "utf8");

    expect(adminLayout).toContain('href: "/admin/verifications"');
    expect(adminLayout).toContain('allowedRoles: ["owner", "admin_ops", "support"]');
    expect(existsSync(resolve("src/app/admin/verifications/page.tsx"))).toBe(true);
    expect(existsSync(resolve("src/app/admin/verifications/[submissionId]/page.tsx"))).toBe(true);
  });
});
