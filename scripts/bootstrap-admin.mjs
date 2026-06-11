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

function requiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function findUserByEmail(supabase, email) {
  let page = 1;

  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100
    });

    if (error) {
      throw error;
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

    if (match || data.users.length < 100) {
      return match ?? null;
    }

    page += 1;
  }

  return null;
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = requiredEnv("ADMIN_EMAIL");
  const adminPassword = requiredEnv("ADMIN_PASSWORD");
  const adminFullName = process.env.ADMIN_FULL_NAME?.trim() || "IOH Admin";
  const adminRole = process.env.ADMIN_ROLE?.trim() || "owner";
  const resetPassword = process.env.ADMIN_RESET_PASSWORD === "true";

  if (!["owner", "admin_ops", "editor", "fulfillment"].includes(adminRole)) {
    throw new Error("ADMIN_ROLE must be owner, admin_ops, editor, or fulfillment.");
  }

  if (adminPassword.length < 10) {
    throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });

  let user = await findUserByEmail(supabase, adminEmail);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      email_confirm: true,
      password: adminPassword,
      user_metadata: {
        full_name: adminFullName
      }
    });

    if (error) {
      throw error;
    }

    user = data.user;
    console.log(`Created auth user: ${adminEmail}`);
  } else {
    console.log(`Auth user already exists: ${adminEmail}`);

    if (resetPassword) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: adminPassword
      });

      if (error) {
        throw error;
      }

      console.log("Updated admin password because ADMIN_RESET_PASSWORD=true.");
    }
  }

  if (!user?.id) {
    throw new Error("Could not resolve admin user id.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    email: adminEmail,
    full_name: adminFullName,
    id: user.id,
    locale: "tr"
  });

  if (profileError) {
    throw profileError;
  }

  const { data: activeRole, error: activeRoleError } = await supabase
    .from("staff_roles")
    .select("id")
    .eq("profile_id", user.id)
    .eq("role", adminRole)
    .is("revoked_at", null)
    .maybeSingle();

  if (activeRoleError) {
    throw activeRoleError;
  }

  if (!activeRole) {
    const { error: roleError } = await supabase.from("staff_roles").insert({
      profile_id: user.id,
      role: adminRole
    });

    if (roleError) {
      throw roleError;
    }
  }

  console.log(`Granted staff role: ${adminRole}`);
  console.log("Admin bootstrap complete.");
  console.log(`Sign in at /sign-in with ADMIN_EMAIL, then open /admin.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
