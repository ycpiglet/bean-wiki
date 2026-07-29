export type ProfileStoreMode = "disabled" | "supabase";

export type ProfileStoreModeReason =
  | "explicitly_disabled"
  | "explicitly_enabled"
  | "development_auto"
  | "missing_credentials"
  | "production_opt_in_required"
  | "invalid_mode";

export type ProfileStoreModeResolution = {
  mode: ProfileStoreMode;
  reason: ProfileStoreModeReason;
};

type ProfileStoreEnvironment = {
  NODE_ENV?: string;
  PROFILE_STORE_MODE?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

function hasSupabaseCredentials(env: ProfileStoreEnvironment): boolean {
  return Boolean(env.SUPABASE_URL?.trim() && env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function resolveProfileStoreMode(
  env: ProfileStoreEnvironment,
): ProfileStoreModeResolution {
  const requested = env.PROFILE_STORE_MODE?.trim().toLowerCase();
  const hasCredentials = hasSupabaseCredentials(env);

  if (requested === "disabled") {
    return { mode: "disabled", reason: "explicitly_disabled" };
  }

  if (requested === "supabase") {
    return hasCredentials
      ? { mode: "supabase", reason: "explicitly_enabled" }
      : { mode: "disabled", reason: "missing_credentials" };
  }

  if (requested && requested !== "auto") {
    return { mode: "disabled", reason: "invalid_mode" };
  }

  if (env.NODE_ENV === "development") {
    return hasCredentials
      ? { mode: "supabase", reason: "development_auto" }
      : { mode: "disabled", reason: "missing_credentials" };
  }

  return { mode: "disabled", reason: "production_opt_in_required" };
}
