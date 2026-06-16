export type StaffRole = "owner" | "admin_ops" | "editor" | "fulfillment";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  locale: string;
  marketing_email_opt_in: boolean;
  marketing_sms_opt_in: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffRoleRow = {
  id: string;
  profile_id: string;
  role: StaffRole;
  granted_by: string | null;
  granted_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AddressType = "shipping" | "billing";

export type Address = {
  id: string;
  profile_id: string | null;
  type: AddressType;
  full_name: string;
  phone: string | null;
  country_code: string;
  city: string;
  district: string | null;
  postal_code: string | null;
  line1: string;
  line2: string | null;
  company_name: string | null;
  tax_no: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductMediaKind =
  | "cover"
  | "gallery"
  | "banner"
  | "download_preview"
  | "certificate";

export type ProductMedia = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  kind: ProductMediaKind;
  storage_bucket: string;
  storage_path: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContentPageStatus = "draft" | "published" | "archived";
export type CollectionKind = "series" | "campaign" | "theme" | "universe";
export type ProductStatus = "draft" | "active" | "archived";
export type ProductType = "book" | "bundle" | "digital" | "claimable" | "nft";
export type VariantFormat =
  | "standard"
  | "signed"
  | "limited"
  | "boxed"
  | "preorder"
  | "ebook"
  | "claimable";
export type FulfillmentType = "physical" | "digital" | "claimable" | "hybrid";
export type StockPolicy = "track" | "continue" | "deny" | "unlimited";
export type CartStatus = "active" | "converted" | "abandoned";
export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "fulfilled"
  | "completed"
  | "cancelled"
  | "refunded";
export type PaymentStatus =
  | "initiated"
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";
export type ShipmentStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled";
export type EntitlementStatus = "pending" | "active" | "revoked" | "expired";
export type WalletProvider = "metamask" | "walletconnect";
export type WalletLinkStatus = "pending" | "verified" | "revoked";
export type ClaimReservationStatus = "reserved" | "claimed" | "expired" | "revoked";
export type TokenCampaignStatus = "draft" | "active" | "paused" | "ended";
export type TokenAllocationStatus = "pending" | "approved" | "sent" | "cancelled" | "refunded";

export type Web3Network = {
  chain_id: number;
  slug: string;
  display_name: string;
  rpc_url_env_key: string | null;
  block_explorer_url: string | null;
  native_currency_symbol: string;
  enabled: boolean;
  supports_nft_claim: boolean;
  supports_nft_sales: boolean;
  supports_token_distribution: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  kind: CollectionKind;
  description: string | null;
  accent_color: string | null;
  sort_order: number;
  status: ContentPageStatus;
  created_at: string;
  updated_at: string;
};

export type ContentPage = {
  id: string;
  slug: string;
  title: string;
  status: ContentPageStatus;
  excerpt: string | null;
  body: Record<string, unknown>;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  collection_id: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  type: ProductType;
  status: ProductStatus;
  description: string | null;
  short_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  requires_shipping: boolean;
  is_digital: boolean;
  is_claimable: boolean;
  is_limited: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  title: string;
  edition_label: string | null;
  format: VariantFormat;
  fulfillment_type: FulfillmentType;
  price_minor: number;
  compare_at_minor: number | null;
  currency: string;
  weight_grams: number | null;
  stock_policy: StockPolicy;
  lead_time_days: number;
  max_per_order: number | null;
  digital_delivery_bucket: string | null;
  digital_delivery_path: string | null;
  digital_download_limit: number | null;
  digital_access_starts_at: string | null;
  digital_access_expires_at: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  variant_id: string;
  on_hand: number;
  reserved: number;
  safety_stock: number;
  warehouse_location: string | null;
  created_at: string;
  updated_at: string;
};

export type Cart = {
  id: string;
  profile_id: string | null;
  anonymous_id: string | null;
  status: CartStatus;
  currency: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price_minor: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  profile_id: string | null;
  cart_id: string | null;
  status: OrderStatus;
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  shipping_minor: number;
  tax_minor: number;
  total_minor: number;
  customer_email: string;
  customer_name: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  legal_acceptance: Record<string, unknown>;
  paid_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_snapshot: Record<string, unknown>;
  variant_snapshot: Record<string, unknown>;
  quantity: number;
  unit_price_minor: number;
  total_minor: number;
  fulfillment_type: FulfillmentType;
  created_at: string;
  updated_at: string;
};

export type PaymentAttempt = {
  id: string;
  order_id: string;
  provider: string;
  provider_reference: string | null;
  provider_status: string | null;
  provider_token: string | null;
  provider_transaction_id: string | null;
  status: PaymentStatus;
  amount_minor: number;
  currency: string;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown>;
  raw_response: Record<string, unknown>;
  failure_code: string | null;
  failure_message: string | null;
  failure_reason: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FulfillmentShipment = {
  id: string;
  order_id: string;
  provider: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  status: ShipmentStatus;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Entitlement = {
  id: string;
  profile_id: string | null;
  order_item_id: string | null;
  variant_id: string | null;
  kind: FulfillmentType;
  status: EntitlementStatus;
  storage_bucket: string | null;
  storage_path: string | null;
  claim_reference: string | null;
  download_limit: number | null;
  download_count: number;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  actor_profile_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type ConsentEvent = {
  id: string;
  profile_id: string | null;
  order_id: string | null;
  email: string | null;
  event_kind: "notice_acknowledgement" | "explicit_consent";
  purpose: string;
  document_slug: string;
  document_version: string;
  granted: boolean;
  channel: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type EmailEvent = {
  id: string;
  event_type: string;
  provider: string;
  recipient: string;
  subject: string;
  status: "queued" | "sent" | "failed" | "skipped";
  order_id: string | null;
  profile_id: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type WalletLink = {
  id: string;
  profile_id: string;
  provider: WalletProvider;
  chain_id: number | null;
  wallet_address: string;
  normalized_address: string;
  nonce: string;
  message: string;
  signature: string | null;
  status: WalletLinkStatus;
  verified_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
  user_wallet_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type UserWallet = {
  id: string;
  profile_id: string;
  provider: WalletProvider;
  chain_id: number | null;
  wallet_address: string;
  normalized_address: string;
  label: string | null;
  is_primary: boolean;
  first_verified_wallet_link_id: string | null;
  last_verified_wallet_link_id: string | null;
  verified_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type NftCollection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  chain_id: number | null;
  contract_address: string | null;
  contract_standard: string;
  status: ContentPageStatus;
  cover_bucket: string | null;
  cover_path: string | null;
  ipfs_metadata_cid: string | null;
  pinata_group_id: string | null;
  product_id: string | null;
  mint_enabled: boolean;
  legal_approved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type NftItem = {
  id: string;
  collection_id: string;
  token_id: string | null;
  title: string;
  description: string | null;
  image_bucket: string | null;
  image_path: string | null;
  image_ipfs_uri: string | null;
  metadata_ipfs_uri: string | null;
  product_id: string | null;
  variant_id: string | null;
  fulfillment_status: string;
  attributes: Array<Record<string, unknown>>;
  status: ContentPageStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ClaimReservation = {
  id: string;
  profile_id: string | null;
  wallet_link_id: string | null;
  collection_id: string | null;
  nft_item_id: string | null;
  wallet_address: string | null;
  normalized_address: string | null;
  status: ClaimReservationStatus;
  allowlist_reason: string | null;
  reserved_at: string;
  claim_opens_at: string | null;
  expires_at: string | null;
  claimed_at: string | null;
  claim_reference: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TokenSaleCampaign = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  token_symbol: string;
  total_sale_limit: string;
  per_user_limit: string | null;
  price_minor: number;
  currency: string;
  starts_at: string | null;
  ends_at: string | null;
  status: TokenCampaignStatus;
  bonus_bps: number;
  legal_approved_at: string | null;
  sales_enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TokenSalePackage = {
  id: string;
  campaign_id: string;
  title: string;
  token_amount: string;
  price_minor: number;
  currency: string;
  max_quantity_per_order: number | null;
  sort_order: number;
  active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TokenAllocation = {
  id: string;
  campaign_id: string;
  package_id: string | null;
  profile_id: string;
  order_id: string | null;
  payment_attempt_id: string | null;
  wallet_id: string | null;
  wallet_address: string;
  normalized_address: string;
  token_symbol: string;
  token_amount: string;
  bonus_amount: string;
  total_amount: string;
  unit_price_minor: number;
  total_price_minor: number;
  currency: string;
  status: TokenAllocationStatus;
  manual_transfer_tx_hash: string | null;
  sent_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "email">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      staff_roles: {
        Row: StaffRoleRow;
        Insert: Partial<StaffRoleRow> & Pick<StaffRoleRow, "profile_id" | "role">;
        Update: Partial<StaffRoleRow>;
        Relationships: [];
      };
      addresses: {
        Row: Address;
        Insert: Partial<Address> & Pick<Address, "type" | "full_name" | "city" | "line1">;
        Update: Partial<Address>;
        Relationships: [];
      };
      product_media: {
        Row: ProductMedia;
        Insert: Partial<ProductMedia> &
          Pick<ProductMedia, "kind" | "storage_bucket" | "storage_path">;
        Update: Partial<ProductMedia>;
        Relationships: [];
      };
      content_pages: {
        Row: ContentPage;
        Insert: Partial<ContentPage> & Pick<ContentPage, "slug" | "title">;
        Update: Partial<ContentPage>;
        Relationships: [];
      };
      collections: {
        Row: Collection;
        Insert: Partial<Collection> & Pick<Collection, "slug" | "title">;
        Update: Partial<Collection>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & Pick<Product, "slug" | "title">;
        Update: Partial<Product>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Partial<ProductVariant> &
          Pick<ProductVariant, "product_id" | "sku" | "title" | "price_minor">;
        Update: Partial<ProductVariant>;
        Relationships: [];
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Partial<InventoryItem> & Pick<InventoryItem, "variant_id">;
        Update: Partial<InventoryItem>;
        Relationships: [];
      };
      carts: {
        Row: Cart;
        Insert: Partial<Cart>;
        Update: Partial<Cart>;
        Relationships: [];
      };
      cart_items: {
        Row: CartItem;
        Insert: Partial<CartItem> &
          Pick<CartItem, "cart_id" | "variant_id" | "quantity" | "unit_price_minor">;
        Update: Partial<CartItem>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order> & Pick<Order, "order_number" | "customer_email">;
        Update: Partial<Order>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem> &
          Pick<
            OrderItem,
            | "order_id"
            | "product_snapshot"
            | "variant_snapshot"
            | "quantity"
            | "unit_price_minor"
            | "total_minor"
            | "fulfillment_type"
          >;
        Update: Partial<OrderItem>;
        Relationships: [];
      };
      payment_attempts: {
        Row: PaymentAttempt;
        Insert: Partial<PaymentAttempt> & Pick<PaymentAttempt, "order_id" | "amount_minor">;
        Update: Partial<PaymentAttempt>;
        Relationships: [];
      };
      fulfillment_shipments: {
        Row: FulfillmentShipment;
        Insert: Partial<FulfillmentShipment> & Pick<FulfillmentShipment, "order_id">;
        Update: Partial<FulfillmentShipment>;
        Relationships: [];
      };
      entitlements: {
        Row: Entitlement;
        Insert: Partial<Entitlement>;
        Update: Partial<Entitlement>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Partial<AuditLog> & Pick<AuditLog, "action" | "entity_type">;
        Update: Partial<AuditLog>;
        Relationships: [];
      };
      consent_events: {
        Row: ConsentEvent;
        Insert: Partial<ConsentEvent> &
          Pick<ConsentEvent, "event_kind" | "purpose" | "document_slug" | "granted">;
        Update: Partial<ConsentEvent>;
        Relationships: [];
      };
      email_events: {
        Row: EmailEvent;
        Insert: Partial<EmailEvent> &
          Pick<EmailEvent, "event_type" | "provider" | "recipient" | "subject" | "status">;
        Update: Partial<EmailEvent>;
        Relationships: [];
      };
      web3_networks: {
        Row: Web3Network;
        Insert: Partial<Web3Network> & Pick<Web3Network, "chain_id" | "slug" | "display_name">;
        Update: Partial<Web3Network>;
        Relationships: [];
      };
      user_wallets: {
        Row: UserWallet;
        Insert: Partial<UserWallet> &
          Pick<UserWallet, "profile_id" | "provider" | "wallet_address" | "normalized_address">;
        Update: Partial<UserWallet>;
        Relationships: [];
      };
      wallet_links: {
        Row: WalletLink;
        Insert: Partial<WalletLink> &
          Pick<WalletLink, "profile_id" | "provider" | "wallet_address" | "normalized_address" | "nonce" | "message">;
        Update: Partial<WalletLink>;
        Relationships: [];
      };
      nft_collections: {
        Row: NftCollection;
        Insert: Partial<NftCollection> & Pick<NftCollection, "slug" | "title">;
        Update: Partial<NftCollection>;
        Relationships: [];
      };
      nft_items: {
        Row: NftItem;
        Insert: Partial<NftItem> & Pick<NftItem, "collection_id" | "title">;
        Update: Partial<NftItem>;
        Relationships: [];
      };
      claim_reservations: {
        Row: ClaimReservation;
        Insert: Partial<ClaimReservation>;
        Update: Partial<ClaimReservation>;
        Relationships: [];
      };
      token_sale_campaigns: {
        Row: TokenSaleCampaign;
        Insert: Partial<TokenSaleCampaign> &
          Pick<TokenSaleCampaign, "slug" | "title" | "token_symbol" | "total_sale_limit" | "price_minor">;
        Update: Partial<TokenSaleCampaign>;
        Relationships: [];
      };
      token_sale_packages: {
        Row: TokenSalePackage;
        Insert: Partial<TokenSalePackage> &
          Pick<TokenSalePackage, "campaign_id" | "title" | "token_amount" | "price_minor">;
        Update: Partial<TokenSalePackage>;
        Relationships: [];
      };
      token_allocations: {
        Row: TokenAllocation;
        Insert: Partial<TokenAllocation> &
          Pick<
            TokenAllocation,
            | "campaign_id"
            | "profile_id"
            | "wallet_address"
            | "normalized_address"
            | "token_symbol"
            | "token_amount"
            | "total_amount"
            | "unit_price_minor"
            | "total_price_minor"
            | "currency"
          >;
        Update: Partial<TokenAllocation>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      commit_checkout_payment_start: {
        Args: {
          p_consent_events: Record<string, unknown>[];
          p_order: Record<string, unknown>;
          p_order_items: Record<string, unknown>[];
          p_payment_attempt: Record<string, unknown>;
          p_profile_marketing?: Record<string, unknown>;
        };
        Returns: {
          order_id: string;
          order_number: string;
          payment_attempt_id: string;
        }[];
      };
      commit_order_stock: {
        Args: {
          p_order_id: string;
        };
        Returns: void;
      };
      commit_token_sale_payment_start: {
        Args: {
          p_allocation: Record<string, unknown>;
          p_order: Record<string, unknown>;
          p_order_item: Record<string, unknown>;
          p_package_id: string;
          p_payment_attempt: Record<string, unknown>;
          p_profile_id: string;
          p_quantity: number;
        };
        Returns: {
          order_id: string;
          order_item_id: string;
          order_number: string;
          payment_attempt_id: string;
        }[];
      };
      release_order_reservation: {
        Args: {
          p_order_id: string;
        };
        Returns: void;
      };
      is_staff: {
        Args: { allowed_roles?: StaffRole[] };
        Returns: boolean;
      };
    };
    Enums: {
      staff_role: StaffRole;
      address_type: AddressType;
      media_kind: ProductMediaKind;
      content_page_status: ContentPageStatus;
      collection_kind: CollectionKind;
      product_status: ProductStatus;
      product_type: ProductType;
      variant_format: VariantFormat;
      fulfillment_type: FulfillmentType;
      stock_policy: StockPolicy;
      cart_status: CartStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      shipment_status: ShipmentStatus;
      entitlement_status: EntitlementStatus;
      wallet_provider: WalletProvider;
      wallet_link_status: WalletLinkStatus;
      claim_reservation_status: ClaimReservationStatus;
      token_campaign_status: TokenCampaignStatus;
      token_allocation_status: TokenAllocationStatus;
    };
  };
};
