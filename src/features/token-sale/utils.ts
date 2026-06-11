const TOKEN_DECIMAL_SCALE = 8;
const TOKEN_DECIMAL_FACTOR = BigInt(10) ** BigInt(TOKEN_DECIMAL_SCALE);

function normalizeDecimalInput(value: string | number) {
  return String(value).trim().replace(",", ".");
}

export function normalizeTokenDecimal(value: string | number, fallback = "0") {
  const text = normalizeDecimalInput(value);

  if (!/^\d+(\.\d{1,8})?$/.test(text)) {
    return fallback;
  }

  const [whole, fraction = ""] = text.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "") || "0";
  const normalizedFraction = fraction.replace(/0+$/, "");

  return normalizedFraction ? `${normalizedWhole}.${normalizedFraction}` : normalizedWhole;
}

function decimalToScaled(value: string | number) {
  const normalized = normalizeTokenDecimal(value);
  const [whole, fraction = ""] = normalized.split(".");
  const paddedFraction = fraction.padEnd(TOKEN_DECIMAL_SCALE, "0").slice(0, TOKEN_DECIMAL_SCALE);

  return BigInt(whole) * TOKEN_DECIMAL_FACTOR + BigInt(paddedFraction || "0");
}

function scaledToDecimal(value: bigint) {
  const whole = value / TOKEN_DECIMAL_FACTOR;
  const fraction = value % TOKEN_DECIMAL_FACTOR;
  const fractionText = fraction.toString().padStart(TOKEN_DECIMAL_SCALE, "0").replace(/0+$/, "");

  return fractionText ? `${whole}.${fractionText}` : whole.toString();
}

export function parseDecimalString(value: FormDataEntryValue | null, fallback = "0") {
  return normalizeTokenDecimal(String(value ?? ""), fallback);
}

export function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseMoneyToMinor(value: FormDataEntryValue | null) {
  const parsed = Number.parseFloat(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : 0;
}

export function formatTokenAmount(value: string | number) {
  const normalized = normalizeTokenDecimal(value);
  const [whole, fraction] = normalized.split(".");
  const wholeWithCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fraction ? `${wholeWithCommas}.${fraction}` : wholeWithCommas;
}

export function calculateBonusAmount(tokenAmount: string | number, bonusBps: number) {
  if (bonusBps <= 0) return "0";

  const amount = decimalToScaled(tokenAmount);
  if (amount <= BigInt(0)) return "0";

  return scaledToDecimal((amount * BigInt(bonusBps)) / BigInt(10000));
}

export function calculateTotalTokenAmount(tokenAmount: string | number, bonusBps: number) {
  return addTokenDecimals(normalizeTokenDecimal(tokenAmount), calculateBonusAmount(tokenAmount, bonusBps));
}

export function multiplyTokenDecimal(value: string | number, multiplier: number) {
  if (!Number.isInteger(multiplier) || multiplier <= 0) return "0";

  return scaledToDecimal(decimalToScaled(value) * BigInt(multiplier));
}

export function addTokenDecimals(...values: Array<string | number>) {
  const total = values.reduce((sum, value) => sum + decimalToScaled(value), BigInt(0));
  return scaledToDecimal(total);
}

export function compareTokenDecimals(left: string | number, right: string | number) {
  const leftScaled = decimalToScaled(left);
  const rightScaled = decimalToScaled(right);

  if (leftScaled === rightScaled) return 0;
  return leftScaled > rightScaled ? 1 : -1;
}
