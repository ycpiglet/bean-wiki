// Admin review queue for self-declared credentials. Gated by isAdminUser
// (ADMIN_EMAILS, or profiles.is_admin) — being signed in is not enough.
import type { NextRequest } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getPlatformUser } from "@/lib/platform-auth";
import {
  ProfileStoreError,
  findProfile,
  listPendingCredentials,
  profileStoreConfigured,
  reviewCredential,
} from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await getPlatformUser();
  if (!user) return { error: Response.json({ error: "auth_required" }, { status: 401 }) };
  if (!profileStoreConfigured()) {
    return {
      error: Response.json(
        { error: "store_not_configured", message: "프로필 저장소가 설정되지 않았습니다." },
        { status: 501 },
      ),
    };
  }
  const profile = await findProfile(user.accountKey).catch(() => null);
  if (!isAdminUser(user, profile)) {
    return { error: Response.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  try {
    return Response.json({ pending: await listPendingCredentials() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "read failed";
    return Response.json({ error: "store_error", message }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  let raw: { id?: string; status?: string; note?: string };
  try {
    raw = (await req.json()) as typeof raw;
  } catch {
    return Response.json({ error: "bad_request", message: "invalid JSON body" }, { status: 400 });
  }

  if (!raw.id || (raw.status !== "verified" && raw.status !== "rejected")) {
    return Response.json(
      { error: "invalid", message: "id와 status(verified|rejected)가 필요합니다." },
      { status: 422 },
    );
  }

  try {
    const credential = await reviewCredential(
      raw.id,
      raw.status,
      gate.user!.email ?? gate.user!.accountKey,
      raw.note,
    );
    return Response.json({ credential });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "review failed";
    return Response.json({ error: "store_error", message }, { status });
  }
}
