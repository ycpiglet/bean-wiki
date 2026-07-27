import { D1UnavailableError } from "../../db";

export function storageUnavailableResponse(
  error: unknown,
  body: Record<string, unknown>,
  status = 503,
): Response {
  if (!(error instanceof D1UnavailableError)) throw error;
  return Response.json(
    { ...body, storageReady: false },
    { status },
  );
}
