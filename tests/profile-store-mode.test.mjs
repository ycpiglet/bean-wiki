import assert from "node:assert/strict";
import test from "node:test";
import { resolveProfileStoreMode } from "../src/lib/profile-store-mode.ts";

const credentials = {
  SUPABASE_URL: "http://127.0.0.1:55321",
  SUPABASE_SERVICE_ROLE_KEY: "local-service-role-key",
};

test("production defaults to disabled even when legacy credentials remain", () => {
  assert.deepEqual(
    resolveProfileStoreMode({ NODE_ENV: "production", ...credentials }),
    { mode: "disabled", reason: "production_opt_in_required" },
  );
});

test("production can explicitly opt in to Supabase", () => {
  assert.deepEqual(
    resolveProfileStoreMode({
      NODE_ENV: "production",
      PROFILE_STORE_MODE: "supabase",
      ...credentials,
    }),
    { mode: "supabase", reason: "explicitly_enabled" },
  );
});

test("development automatically uses configured local Supabase", () => {
  assert.deepEqual(
    resolveProfileStoreMode({ NODE_ENV: "development", ...credentials }),
    { mode: "supabase", reason: "development_auto" },
  );
});

test("explicit disabled mode wins in every environment", () => {
  assert.deepEqual(
    resolveProfileStoreMode({
      NODE_ENV: "development",
      PROFILE_STORE_MODE: "disabled",
      ...credentials,
    }),
    { mode: "disabled", reason: "explicitly_disabled" },
  );
});

test("explicit Supabase mode fails closed without both credentials", () => {
  assert.deepEqual(
    resolveProfileStoreMode({
      NODE_ENV: "production",
      PROFILE_STORE_MODE: "supabase",
      SUPABASE_URL: credentials.SUPABASE_URL,
    }),
    { mode: "disabled", reason: "missing_credentials" },
  );
});

test("unknown mode fails closed", () => {
  assert.deepEqual(
    resolveProfileStoreMode({
      NODE_ENV: "development",
      PROFILE_STORE_MODE: "memory",
      ...credentials,
    }),
    { mode: "disabled", reason: "invalid_mode" },
  );
});
