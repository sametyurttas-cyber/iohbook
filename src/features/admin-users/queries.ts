import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import {
  ADMIN_USERS_READ_ROLES,
  canManageAdminUserPoints
} from "@/features/admin-users/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  Address,
  IohPointBalance,
  IohPointLedger,
  Order,
  Profile,
  UserWallet
} from "@/types/database";

export type AdminUsersFilters = {
  city?: string;
  country?: string;
  hasOrders?: "all" | "no" | "yes";
  hasPoints?: "all" | "yes";
  q?: string;
  sort?: "created_asc" | "created_desc";
  wallet?: "all" | "no" | "yes";
};

export type AdminUserRow = {
  accountStatus: string;
  balance: number;
  city: string | null;
  countryCode: string | null;
  createdAt: string;
  email: string;
  fullName: string | null;
  hasWallet: boolean;
  id: string;
  lastOrderAt: string | null;
  orderCount: number;
  totalSpentMinor: number;
};

export type AdminUserDetail = AdminUserRow & {
  adminNotes: string | null;
  addresses: Address[];
  canManagePoints: boolean;
  ledger: IohPointLedger[];
  lifetimeEarned: number;
  lifetimeSpent: number;
  orders: Pick<
    Order,
    "created_at" | "currency" | "id" | "order_number" | "status" | "total_minor"
  >[];
  phone: string | null;
  pointsAvailable: boolean;
  wallets: UserWallet[];
};

type OrderSummary = Pick<
  Order,
  "created_at" | "currency" | "id" | "order_number" | "profile_id" | "status" | "total_minor"
>;

function firstAddress(addresses: Address[]) {
  return [...addresses].sort((a, b) => {
    if (a.is_default !== b.is_default) {
      return a.is_default ? -1 : 1;
    }

    return Date.parse(b.created_at) - Date.parse(a.created_at);
  })[0];
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isMissingRelationError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    error?.message?.includes("Could not find the table")
  );
}

export async function requireAdminUsersReadStaff() {
  const staff = await requireStaff(ADMIN_USERS_READ_ROLES);

  if (!staff) {
    redirect("/unauthorized");
  }

  return {
    ...staff,
    canManagePoints: canManageAdminUserPoints(staff.roles)
  };
}

export async function requireAdminUsersPointManager() {
  const staff = await requireStaff(["owner", "admin_ops"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  return staff;
}

export function buildAdminUserRows(input: {
  addresses: Address[];
  balances: IohPointBalance[];
  orders: OrderSummary[];
  profiles: Profile[];
  wallets: UserWallet[];
}) {
  const addressesByProfile = new Map<string, Address[]>();
  const walletsByProfile = new Map<string, UserWallet[]>();
  const ordersByProfile = new Map<string, OrderSummary[]>();
  const balancesByProfile = new Map<string, IohPointBalance>();

  for (const address of input.addresses) {
    if (!address.profile_id) continue;
    addressesByProfile.set(address.profile_id, [
      ...(addressesByProfile.get(address.profile_id) ?? []),
      address
    ]);
  }

  for (const wallet of input.wallets) {
    walletsByProfile.set(wallet.profile_id, [
      ...(walletsByProfile.get(wallet.profile_id) ?? []),
      wallet
    ]);
  }

  for (const order of input.orders) {
    if (!order.profile_id) continue;
    ordersByProfile.set(order.profile_id, [
      ...(ordersByProfile.get(order.profile_id) ?? []),
      order
    ]);
  }

  for (const balance of input.balances) {
    balancesByProfile.set(balance.profile_id, balance);
  }

  return input.profiles.map((profile) => {
    const address = firstAddress(addressesByProfile.get(profile.id) ?? []);
    const orders = ordersByProfile.get(profile.id) ?? [];
    const sortedOrders = [...orders].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
    const totalSpentMinor = orders
      .filter((order) => ["paid", "fulfilled", "completed"].includes(order.status))
      .reduce((sum, order) => sum + order.total_minor, 0);

    return {
      accountStatus: "Aktif",
      balance: balancesByProfile.get(profile.id)?.balance ?? 0,
      city: address?.city ?? null,
      countryCode: address?.country_code ?? null,
      createdAt: profile.created_at,
      email: profile.email,
      fullName: profile.full_name,
      hasWallet: (walletsByProfile.get(profile.id) ?? []).some((wallet) => !wallet.revoked_at),
      id: profile.id,
      lastOrderAt: sortedOrders[0]?.created_at ?? null,
      orderCount: orders.length,
      totalSpentMinor
    } satisfies AdminUserRow;
  });
}

export function filterAdminUserRows(rows: AdminUserRow[], filters: AdminUsersFilters) {
  const q = normalize(filters.q);
  const city = normalize(filters.city);
  const country = normalize(filters.country);

  return rows
    .filter((row) => {
      const matchesQuery =
        !q ||
        normalize(row.email).includes(q) ||
        normalize(row.fullName).includes(q);
      const matchesCity = !city || normalize(row.city).includes(city);
      const matchesCountry = !country || normalize(row.countryCode).includes(country);
      const matchesWallet =
        !filters.wallet ||
        filters.wallet === "all" ||
        (filters.wallet === "yes" ? row.hasWallet : !row.hasWallet);
      const matchesPoints =
        !filters.hasPoints || filters.hasPoints === "all" || row.balance > 0;
      const matchesOrders =
        !filters.hasOrders ||
        filters.hasOrders === "all" ||
        (filters.hasOrders === "yes" ? row.orderCount > 0 : row.orderCount === 0);

      return (
        matchesQuery &&
        matchesCity &&
        matchesCountry &&
        matchesWallet &&
        matchesPoints &&
        matchesOrders
      );
    })
    .sort((a, b) => {
      const direction = filters.sort === "created_asc" ? 1 : -1;
      return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * direction;
    });
}

export async function listAdminUsers(filters: AdminUsersFilters = {}) {
  await requireAdminUsersReadStaff();
  const supabase = createSupabaseServiceRoleClient();
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (profileError) throw profileError;

  const profileIds = (profiles ?? []).map((profile) => profile.id);

  if (profileIds.length === 0) {
    return [];
  }

  const [addressesResult, balancesResult, ordersResult, walletsResult] = await Promise.all([
    supabase.from("addresses").select("*").in("profile_id", profileIds).limit(500),
    supabase.from("ioh_point_balances").select("*").in("profile_id", profileIds).limit(500),
    supabase
      .from("orders")
      .select("id, profile_id, order_number, status, total_minor, currency, created_at")
      .in("profile_id", profileIds)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("user_wallets")
      .select("*")
      .in("profile_id", profileIds)
      .order("created_at", { ascending: false })
      .limit(500)
  ]);

  if (addressesResult.error) throw addressesResult.error;
  if (balancesResult.error && !isMissingRelationError(balancesResult.error)) {
    throw balancesResult.error;
  }
  if (ordersResult.error) throw ordersResult.error;
  if (walletsResult.error) throw walletsResult.error;

  return filterAdminUserRows(
    buildAdminUserRows({
      addresses: (addressesResult.data ?? []) as Address[],
      balances: balancesResult.error ? [] : ((balancesResult.data ?? []) as IohPointBalance[]),
      orders: (ordersResult.data ?? []) as OrderSummary[],
      profiles: (profiles ?? []) as Profile[],
      wallets: (walletsResult.data ?? []) as UserWallet[]
    }),
    filters
  );
}

export async function getAdminUserDetail(profileId: string) {
  const staff = await requireAdminUsersReadStaff();
  const supabase = createSupabaseServiceRoleClient();
  const [
    profileResult,
    addressesResult,
    balanceResult,
    ledgerResult,
    ordersResult,
    walletsResult
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
    supabase
      .from("addresses")
      .select("*")
      .eq("profile_id", profileId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("ioh_point_balances").select("*").eq("profile_id", profileId).maybeSingle(),
    supabase
      .from("ioh_point_ledger")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("orders")
      .select("id, order_number, status, total_minor, currency, created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("user_wallets")
      .select("*")
      .eq("profile_id", profileId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  if (profileResult.error) throw profileResult.error;
  if (addressesResult.error) throw addressesResult.error;
  if (balanceResult.error && !isMissingRelationError(balanceResult.error)) {
    throw balanceResult.error;
  }
  if (ledgerResult.error && !isMissingRelationError(ledgerResult.error)) {
    throw ledgerResult.error;
  }
  if (ordersResult.error) throw ordersResult.error;
  if (walletsResult.error) throw walletsResult.error;

  if (!profileResult.data) {
    return null;
  }

  const row = buildAdminUserRows({
    addresses: (addressesResult.data ?? []) as Address[],
    balances: balanceResult.error || !balanceResult.data ? [] : ([balanceResult.data] as IohPointBalance[]),
    orders: ((ordersResult.data ?? []) as Pick<
      Order,
      "created_at" | "currency" | "id" | "order_number" | "status" | "total_minor"
    >[]).map((order) => ({ ...order, profile_id: profileId })),
    profiles: [profileResult.data as Profile],
    wallets: (walletsResult.data ?? []) as UserWallet[]
  })[0];

  const balance = balanceResult.error ? null : (balanceResult.data as IohPointBalance | null);

  return {
    ...row,
    adminNotes: profileResult.data.admin_notes ?? null,
    addresses: (addressesResult.data ?? []) as Address[],
    ledger: ledgerResult.error ? [] : ((ledgerResult.data ?? []) as IohPointLedger[]),
    lifetimeEarned: balance?.lifetime_earned ?? 0,
    lifetimeSpent: balance?.lifetime_spent ?? 0,
    orders: (ordersResult.data ?? []) as AdminUserDetail["orders"],
    phone: profileResult.data.phone ?? null,
    pointsAvailable: !balanceResult.error && !ledgerResult.error,
    wallets: (walletsResult.data ?? []) as UserWallet[],
    canManagePoints: staff.canManagePoints
  };
}
