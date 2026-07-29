// Expertise credentials (SCA certificates, Q Grader, …). Submitting one is
// self-declaration: the row lands as `pending` and only an admin review can
// turn it into a public badge, so this route never sets `status` from input.
import type { NextRequest } from "next/server";
import { getPlatformUser } from "@/lib/platform-auth";
import {
  ProfileStoreError,
  addCredential,
  deleteCredential,
  getOrCreateProfile,
  listCredentials,
  profileStoreConfigured,
  sanitizeCredential,
} from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard() {
  return profileStoreConfigured()
    ? null
    : Response.json(
        {
          error: "store_not_configured",
          message: "프로필 저장소가 설정되지 않았습니다.",
        },
        { status: 501 },
      );
}

export async function GET() {
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const blocked = guard();
  if (blocked) return blocked;

  try {
    return Response.json({ credentials: await listCredentials(user.accountKey) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "read failed";
    return Response.json({ error: "store_error", message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const blocked = guard();
  if (blocked) return blocked;

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "bad_request", message: "invalid JSON body" }, { status: 400 });
  }

  const { value, errors } = sanitizeCredential(raw);
  if (errors.length) return Response.json({ error: "invalid", errors }, { status: 422 });

  try {
    await getOrCreateProfile(user);
    const credential = await addCredential(user.accountKey, value);
    return Response.json({ credential });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "submit failed";
    return Response.json({ error: "store_error", message }, { status });
  }
}

// Withdraw one's own submission. Scoped by account_key in the query, so a user
// cannot delete somebody else's credential by guessing an id.
export async function DELETE(req: NextRequest) {
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const blocked = guard();
  if (blocked) return blocked;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "bad_request", message: "id required" }, { status: 400 });

  try {
    await deleteCredential(user.accountKey, id);
    return Response.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "delete failed";
    return Response.json({ error: "store_error", message }, { status: 502 });
  }
}
