import type { TokenSaleCampaign, TokenSalePackage } from "@/types/database";
import { addTokenDecimals, compareTokenDecimals } from "@/features/token-sale/utils";

type TokenSaleLimitInput = {
  campaign: Pick<
    TokenSaleCampaign,
    "ends_at" | "per_user_limit" | "sales_enabled" | "starts_at" | "status" | "total_sale_limit"
  >;
  campaignAllocated: string;
  pkg: Pick<TokenSalePackage, "max_quantity_per_order">;
  quantity: number;
  requestedTotal: string;
  userAllocated: string;
};

export function validateTokenSaleLimits(input: TokenSaleLimitInput, now = new Date()) {
  if (input.campaign.status !== "active" || !input.campaign.sales_enabled) {
    return "campaign-not-active";
  }

  if (input.campaign.starts_at && new Date(input.campaign.starts_at).getTime() > now.getTime()) {
    return "sale-not-started";
  }

  if (input.campaign.ends_at && new Date(input.campaign.ends_at).getTime() < now.getTime()) {
    return "sale-ended";
  }

  if (input.pkg.max_quantity_per_order && input.quantity > input.pkg.max_quantity_per_order) {
    return "package-limit";
  }

  if (compareTokenDecimals(addTokenDecimals(input.campaignAllocated, input.requestedTotal), input.campaign.total_sale_limit) > 0) {
    return "total-limit";
  }

  if (
    input.campaign.per_user_limit &&
    compareTokenDecimals(addTokenDecimals(input.userAllocated, input.requestedTotal), input.campaign.per_user_limit) > 0
  ) {
    return "user-limit";
  }

  return null;
}

export function hasAcceptedTokenSaleTerms(input: Pick<FormData, "get">) {
  return input.get("token_sale_terms") === "on";
}
