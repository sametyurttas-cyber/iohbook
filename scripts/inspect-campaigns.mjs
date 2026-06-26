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
  console.log("=== RAW CAMPAIGN DATA ===");
  const { data: campaigns, error: campaignErr } = await supabase
    .from("token_sale_campaigns")
    .select("*");

  if (campaignErr) {
    console.error("Error:", campaignErr);
    process.exit(1);
  }

  for (const camp of campaigns) {
    console.log("Campaign ID:", camp.id);
    console.log("total_sale_limit raw:", camp.total_sale_limit, "type:", typeof camp.total_sale_limit);
    console.log("per_user_limit raw:", camp.per_user_limit, "type:", typeof camp.per_user_limit);
  }
}

run().catch(console.error);
