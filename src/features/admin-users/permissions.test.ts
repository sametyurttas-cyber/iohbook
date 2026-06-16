import { describe, expect, it } from "vitest";
import {
  canManageAdminUserPoints,
  canReadAdminUsers,
  validateManualPointAdjustment
} from "@/features/admin-users/permissions";

describe("admin users permissions", () => {
  it("allows CRM read for operations roles but not editor", () => {
    expect(canReadAdminUsers(["owner"])).toBe(true);
    expect(canReadAdminUsers(["admin_ops"])).toBe(true);
    expect(canReadAdminUsers(["fulfillment"])).toBe(true);
    expect(canReadAdminUsers(["support"])).toBe(false);
    expect(canReadAdminUsers(["editor"])).toBe(false);
    expect(canReadAdminUsers([])).toBe(false);
  });

  it("allows manual point management only for owner and admin ops", () => {
    expect(canManageAdminUserPoints(["owner"])).toBe(true);
    expect(canManageAdminUserPoints(["admin_ops"])).toBe(true);
    expect(canManageAdminUserPoints(["support"])).toBe(false);
    expect(canManageAdminUserPoints(["fulfillment"])).toBe(false);
  });

  it("blocks manual point adjustments that would create negative balance", () => {
    expect(
      validateManualPointAdjustment({
        amount: -11,
        currentBalance: 10,
        reason: "Destek duzeltmesi"
      })
    ).toBe("negative-balance");
  });
});
