"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import { refreshAnalyticsRollups } from "@/features/admin-analytics/rollup";

export async function refreshAnalyticsRollupsAction() {
  const staff = await requireStaff(["owner", "admin_ops"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  await refreshAnalyticsRollups(90);
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
}
