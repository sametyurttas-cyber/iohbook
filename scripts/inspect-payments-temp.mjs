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

async function run() {
  console.log("=== Latest 5 Payment Attempts ===");
  const { data: attempts, error } = await supabase
    .from("payment_attempts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error(error);
    return;
  }

  for (const att of attempts) {
    console.log(`ID: ${att.id}`);
    console.log(`  OrderID: ${att.order_id}`);
    console.log(`  Status: ${att.status}`);
    console.log(`  Reference (note): ${att.provider_reference}`);
    console.log(`  TransID (shopier order id): ${att.provider_transaction_id}`);
    console.log(`  AmountMinor: ${att.amount_minor}`);
    console.log(`  CreatedAt: ${att.created_at}`);
    console.log(`  VerifiedAt: ${att.verified_at}`);
    console.log(`  Raw Response: ${JSON.stringify(att.raw_response)}`);
    console.log(`  Failure Reason: ${att.failure_reason}`);
  }

  console.log("\n=== Latest 5 Audit Logs ===");
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  
  if (logs) {
    for (const log of logs) {
      console.log(`[${log.created_at}] Action: ${log.action}, Details: ${JSON.stringify(log.metadata || log.after_data)}`);
    }
  }
}

run().catch(console.error);
