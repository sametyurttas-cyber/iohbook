export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "signup",
  "login",
  "profile_completed",
  "product_view",
  "book_view",
  "add_to_cart",
  "checkout_started",
  "order_paid",
  "download_started",
  "download_completed",
  "download_failed",
  "amazon_verification_submitted",
  "amazon_verification_approved",
  "amazon_verification_rejected",
  "ioh_points_awarded",
  "encyclopedia_view",
  "referral_rewarded"
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsDeviceType = "desktop" | "mobile" | "tablet" | "unknown";

export type AnalyticsTrackPayload = {
  eventId: string;
  eventName: AnalyticsEventName;
  sessionId: string;
  path: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  metadata?: Record<string, unknown>;
};

export const ANALYTICS_METADATA_KEYS: Record<AnalyticsEventName, readonly string[]> = {
  page_view: [],
  signup: ["method"],
  login: ["method"],
  profile_completed: ["source"],
  product_view: ["product_id", "product_slug", "variant_id", "format"],
  book_view: ["product_id", "product_slug", "variant_id", "format"],
  add_to_cart: [
    "product_id",
    "product_slug",
    "variant_id",
    "quantity",
    "currency",
    "amount_minor"
  ],
  checkout_started: ["cart_id", "order_id", "item_count", "currency", "amount_minor", "provider"],
  order_paid: ["order_id", "currency", "revenue_minor", "provider"],
  download_started: ["entitlement_id", "product_slug", "format"],
  download_completed: ["entitlement_id", "product_slug", "format"],
  download_failed: ["entitlement_id", "product_slug", "format", "reason"],
  amazon_verification_submitted: ["submission_id", "kind", "book_slug"],
  amazon_verification_approved: [
    "submission_id",
    "kind",
    "book_slug",
    "reward_amount"
  ],
  amazon_verification_rejected: ["submission_id", "kind", "book_slug"],
  ioh_points_awarded: ["ledger_id", "reason", "amount", "order_id"],
  encyclopedia_view: ["entity_type", "entity_slug", "entity_title"],
  referral_rewarded: [
    "referral_id",
    "referrer_reward_ledger_id",
    "referred_reward_ledger_id",
    "reward_each"
  ]
};
