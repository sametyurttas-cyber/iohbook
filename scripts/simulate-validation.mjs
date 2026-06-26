import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    return;
  }
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Re-implement or copy functions for testing in JS
const TOKEN_DECIMAL_SCALE = 8;
const TOKEN_DECIMAL_FACTOR = BigInt(10) ** BigInt(TOKEN_DECIMAL_SCALE);

function normalizeDecimalInput(value) {
  return String(value).trim().replace(",", ".");
}

function normalizeTokenDecimal(value, fallback = "0") {
  const text = normalizeDecimalInput(value);
  if (!/^\d+(\.\d{1,8})?$/.test(text)) {
    return fallback;
  }
  const [whole, fraction = ""] = text.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "") || "0";
  const normalizedFraction = fraction.replace(/0+$/, "");
  return normalizedFraction ? `${normalizedWhole}.${normalizedFraction}` : normalizedWhole;
}

function decimalToScaled(value) {
  const normalized = normalizeTokenDecimal(value);
  const [whole, fraction = ""] = normalized.split(".");
  const paddedFraction = fraction.padEnd(TOKEN_DECIMAL_SCALE, "0").slice(0, TOKEN_DECIMAL_SCALE);
  return BigInt(whole) * TOKEN_DECIMAL_FACTOR + BigInt(paddedFraction || "0");
}

function scaledToDecimal(value) {
  const whole = value / TOKEN_DECIMAL_FACTOR;
  const fraction = value % TOKEN_DECIMAL_FACTOR;
  const fractionText = fraction.toString().padStart(TOKEN_DECIMAL_SCALE, "0").replace(/0+$/, "");
  return fractionText ? `${whole}.${fractionText}` : whole.toString();
}

function calculateBonusAmount(tokenAmount, bonusBps) {
  if (bonusBps <= 0) return "0";
  const amount = decimalToScaled(tokenAmount);
  if (amount <= BigInt(0)) return "0";
  return scaledToDecimal((amount * BigInt(bonusBps)) / BigInt(10000));
}

function calculateTotalTokenAmount(tokenAmount, bonusBps) {
  return addTokenDecimals(normalizeTokenDecimal(tokenAmount), calculateBonusAmount(tokenAmount, bonusBps));
}

function multiplyTokenDecimal(value, multiplier) {
  if (!Number.isInteger(multiplier) || multiplier <= 0) return "0";
  return scaledToDecimal(decimalToScaled(value) * BigInt(multiplier));
}

function addTokenDecimals(...values) {
  const total = values.reduce((sum, value) => sum + decimalToScaled(value), BigInt(0));
  return scaledToDecimal(total);
}

function compareTokenDecimals(left, right) {
  const leftScaled = decimalToScaled(left);
  const rightScaled = decimalToScaled(right);
  if (leftScaled === rightScaled) return 0;
  return leftScaled > rightScaled ? 1 : -1;
}

async function run() {
  const packageId = "ff665ca6-2c36-42cc-819c-76079099e498"; // package ID from output
  const quantity = 1;

  const { data: pkg } = await supabase
    .from("token_sale_packages")
    .select("*, token_sale_campaigns(*)")
    .eq("id", packageId)
    .single();

  const campaign = pkg.token_sale_campaigns;

  const tokenAmount = multiplyTokenDecimal(pkg.token_amount, quantity);
  const bonusAmount = calculateBonusAmount(tokenAmount, campaign.bonus_bps);
  const totalTokenAmount = calculateTotalTokenAmount(tokenAmount, campaign.bonus_bps);

  console.log("Package Details:", {
    token_amount: pkg.token_amount,
    price_minor: pkg.price_minor,
    max_quantity_per_order: pkg.max_quantity_per_order
  });

  console.log("Campaign Details:", {
    id: campaign.id,
    title: campaign.title,
    total_sale_limit: campaign.total_sale_limit,
    per_user_limit: campaign.per_user_limit,
    bonus_bps: campaign.bonus_bps
  });

  console.log("Calculated Amounts:", {
    tokenAmount,
    bonusAmount,
    totalTokenAmount
  });

  // Let's get allocations
  const [{ data: campaignAllocations }, { data: userAllocations }] = await Promise.all([
    supabase
      .from("token_allocations")
      .select("total_amount")
      .eq("campaign_id", campaign.id)
      .in("status", ["pending", "approved", "sent"]),
    supabase
      .from("token_allocations")
      .select("total_amount")
      .eq("campaign_id", campaign.id)
      .eq("profile_id", "c129e794-fb5e-4c74-a6ef-10dfc7857007") // placeholder or mock
      .in("status", ["pending", "approved", "sent"])
  ]);

  const campaignAllocated = addTokenDecimals(...(campaignAllocations ?? []).map(a => a.total_amount));
  const userAllocated = addTokenDecimals(...(userAllocations ?? []).map(a => a.total_amount));

  console.log("Allocated Amounts:", {
    campaignAllocated,
    userAllocated
  });

  const campaignAllocatedScaled = decimalToScaled(campaignAllocated);
  const requestedTotalScaled = decimalToScaled(totalTokenAmount);
  const sumScaled = campaignAllocatedScaled + requestedTotalScaled;
  const campaignLimitScaled = decimalToScaled(campaign.total_sale_limit);

  console.log("Comparing Campaign Total Limit:", {
    campaignAllocatedScaled: campaignAllocatedScaled.toString(),
    requestedTotalScaled: requestedTotalScaled.toString(),
    sumScaled: sumScaled.toString(),
    campaignLimitScaled: campaignLimitScaled.toString(),
    exceeds: sumScaled > campaignLimitScaled
  });
}

run().catch(console.error);
