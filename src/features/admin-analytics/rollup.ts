import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function refreshAnalyticsRollups(days = 90) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("refresh_analytics_daily_rollups", {
    p_days: days
  });

  if (error) {
    throw error;
  }

  return data ?? 0;
}
