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
      .is("revoked_at", null);

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
