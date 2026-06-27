import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/types/database";

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getCurrentStaffRoles() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("staff_roles")
      .select("role")
      .eq("profile_id", user.id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return data.map((row) => row.role);
  } catch {
    return [];
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function requireStaff(allowedRoles?: StaffRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const roles = await getCurrentStaffRoles();
  const hasRole = allowedRoles?.length
    ? roles.some((role) => allowedRoles.includes(role))
    : roles.length > 0;

  if (!hasRole) {
    return null;
  }

  return { roles, user };
}

export async function getHeaderUserView() {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const [profileRes, pointsRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("ioh_point_balances").select("balance").eq("profile_id", user.id).maybeSingle(),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("profile_id", user.id)
    ]);
    const profile = profileRes.data;
    const pointsBalance = pointsRes.data?.balance ?? 0;
    const orderCount = ordersRes.count ?? 0;

    const displayName = profile?.full_name || profile?.email || user.email || "Hesabim";
    return {
      displayName,
      points: pointsBalance,
      email: profile?.email || user.email || "",
      orderCount
    };
  } catch {
    return {
      displayName: user.email || "Hesabim",
      points: 0,
      email: user.email || "",
      orderCount: 0
    };
  }
}
