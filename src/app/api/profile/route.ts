// The signed-in user's own profile: read it, or patch the self-editable fields.
// Skill and admin fields are server-derived and rejected here by omission —
// sanitizeProfilePatch only ever returns the editable subset.
import type { NextRequest } from "next/server";
import { getPlatformUser } from "@/lib/platform-auth";
import { crossOriginBlocked } from "@/lib/same-origin";
import {
  ProfileStoreError,
  getOrCreateProfile,
  listCredentials,
  profileStoreConfigured,
  sanitizeProfilePatch,
  updateProfile,
} from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unconfigured() {
  return Response.json(
    {
      error: "store_not_configured",
      message:
        "프로필 저장소가 설정되지 않았습니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.",
    },
    { status: 501 },
  );
}

export async function GET() {
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (!profileStoreConfigured()) return unconfigured();

  try {
    const profile = await getOrCreateProfile(user);
    const credentials = await listCredentials(user.accountKey);
    return Response.json({ profile, credentials });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "profile read failed";
    return Response.json({ error: "store_error", message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const blockedOrigin = crossOriginBlocked(req);
  if (blockedOrigin) return blockedOrigin;
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (!profileStoreConfigured()) return unconfigured();

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "bad_request", message: "invalid JSON body" }, { status: 400 });
  }

  const { patch, errors } = sanitizeProfilePatch(raw);
  if (errors.length) return Response.json({ error: "invalid", errors }, { status: 422 });

  try {
    await getOrCreateProfile(user); // first-visit safety: PATCH needs a row
    const profile = await updateProfile(user.accountKey, patch);
    return Response.json({ profile });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "profile update failed";
    return Response.json({ error: "store_error", message }, { status });
  }
}
