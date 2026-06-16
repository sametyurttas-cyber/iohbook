import type { StaffRole } from "@/types/database";

export const ADMIN_USERS_READ_ROLES: StaffRole[] = ["owner", "admin_ops", "fulfillment"];
export const ADMIN_USERS_MANAGE_POINTS_ROLES: StaffRole[] = ["owner", "admin_ops"];

export function hasAnyRole(roles: StaffRole[], allowedRoles: StaffRole[]) {
  return roles.some((role) => allowedRoles.includes(role));
}

export function canReadAdminUsers(roles: StaffRole[]) {
  return hasAnyRole(roles, ADMIN_USERS_READ_ROLES) && !roles.includes("editor");
}

export function canManageAdminUserPoints(roles: StaffRole[]) {
  return hasAnyRole(roles, ADMIN_USERS_MANAGE_POINTS_ROLES);
}

export function validateManualPointAdjustment(input: {
  amount: number;
  currentBalance: number;
  reason: string;
}) {
  if (!Number.isInteger(input.amount) || input.amount === 0) {
    return "amount-required";
  }

  if (input.reason.trim().length < 3) {
    return "reason-required";
  }

  if (input.currentBalance + input.amount < 0) {
    return "negative-balance";
  }

  return null;
}
