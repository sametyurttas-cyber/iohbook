import { describe, expect, it } from "vitest";
import { buildAdminUserRows, filterAdminUserRows } from "@/features/admin-users/queries";
import type { Address, IohPointBalance, Order, Profile, UserWallet } from "@/types/database";

const profile = {
  admin_notes: null,
  created_at: "2026-06-01T10:00:00.000Z",
  email: "samet@example.com",
  full_name: "Samet Yurttas",
  id: "profile-1",
  locale: "tr",
  marketing_email_opt_in: false,
  marketing_sms_opt_in: false,
  phone: null,
  updated_at: "2026-06-01T10:00:00.000Z"
} satisfies Profile;

describe("admin users queries", () => {
  it("builds list rows with points, wallet and order summary", () => {
    const rows = buildAdminUserRows({
      addresses: [
        {
          city: "Istanbul",
          company_name: null,
          country_code: "TR",
          created_at: "2026-06-02T10:00:00.000Z",
          district: null,
          full_name: "Samet Yurttas",
          id: "address-1",
          is_default: true,
          line1: "Adres",
          line2: null,
          phone: null,
          postal_code: null,
          profile_id: profile.id,
          tax_no: null,
          type: "shipping",
          updated_at: "2026-06-02T10:00:00.000Z"
        } satisfies Address
      ],
      balances: [
        {
          balance: 40,
          created_at: "2026-06-02T10:00:00.000Z",
          lifetime_earned: 40,
          lifetime_spent: 0,
          profile_id: profile.id,
          updated_at: "2026-06-02T10:00:00.000Z"
        } satisfies IohPointBalance
      ],
      orders: [
        {
          cart_id: null,
          cancelled_at: null,
          completed_at: null,
          created_at: "2026-06-03T10:00:00.000Z",
          currency: "TRY",
          customer_email: profile.email,
          customer_name: profile.full_name,
          discount_minor: 0,
          id: "order-1",
          legal_acceptance: {},
          order_number: "IOH-1",
          paid_at: "2026-06-03T10:00:00.000Z",
          profile_id: profile.id,
          shipping_minor: 0,
          status: "paid",
          subtotal_minor: 10000,
          tax_minor: 0,
          total_minor: 10000,
          updated_at: "2026-06-03T10:00:00.000Z",
          billing_address: null,
          shipping_address: null
        } satisfies Order
      ],
      profiles: [profile],
      wallets: [
        {
          chain_id: 1,
          created_at: "2026-06-02T10:00:00.000Z",
          first_verified_wallet_link_id: null,
          id: "wallet-1",
          is_primary: true,
          label: null,
          last_seen_at: null,
          last_verified_wallet_link_id: null,
          metadata: {},
          normalized_address: "0xabc",
          profile_id: profile.id,
          provider: "metamask",
          revoked_at: null,
          updated_at: "2026-06-02T10:00:00.000Z",
          verified_at: "2026-06-02T10:00:00.000Z",
          wallet_address: "0xabc"
        } satisfies UserWallet
      ]
    });

    expect(rows[0]).toMatchObject({
      balance: 40,
      city: "Istanbul",
      countryCode: "TR",
      hasWallet: true,
      orderCount: 1,
      totalSpentMinor: 10000
    });
  });

  it("filters by email/name, wallet, points and orders", () => {
    const rows = [
      {
        accountStatus: "Aktif",
        balance: 10,
        city: "Istanbul",
        countryCode: "TR",
        createdAt: "2026-06-01T10:00:00.000Z",
        email: "samet@example.com",
        fullName: "Samet Yurttas",
        hasWallet: true,
        id: "profile-1",
        lastOrderAt: "2026-06-03T10:00:00.000Z",
        orderCount: 1,
        totalSpentMinor: 10000
      },
      {
        accountStatus: "Aktif",
        balance: 0,
        city: null,
        countryCode: null,
        createdAt: "2026-06-02T10:00:00.000Z",
        email: "guest@example.com",
        fullName: null,
        hasWallet: false,
        id: "profile-2",
        lastOrderAt: null,
        orderCount: 0,
        totalSpentMinor: 0
      }
    ];

    expect(
      filterAdminUserRows(rows, {
        hasOrders: "yes",
        hasPoints: "yes",
        q: "samet",
        wallet: "yes"
      })
    ).toHaveLength(1);
  });
});
