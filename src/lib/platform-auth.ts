import { headers } from "next/headers";
import { readSession, type Session } from "@/lib/session";

export type PlatformUser = {
  accountKey: string;
  displayName: string;
  email: string | null;
  fullName: string | null;
  provider: "google" | "github" | "chatgpt";
  avatar: string | null;
};

const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";

export async function getPlatformUser(
  sessionOverride?: Session | null,
): Promise<PlatformUser | null> {
  const session =
    sessionOverride === undefined ? await readSession() : sessionOverride;
  if (session) {
    const email = session.user.email?.trim() || null;
    return {
      accountKey:
        email?.toLowerCase() ??
        `${session.user.provider}:${session.user.id.toLowerCase()}`,
      displayName: session.user.name,
      email,
      fullName: session.user.name,
      provider: session.user.provider,
      avatar: session.user.avatar ?? null,
    };
  }

  const requestHeaders = await headers();
  const email = requestHeaders.get(USER_EMAIL_HEADER)?.trim() || null;
  if (!email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    accountKey: email.toLowerCase(),
    displayName: fullName ?? email.split("@")[0],
    email,
    fullName,
    provider: "chatgpt",
    avatar: null,
  };
}

export function platformSignOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || isReservedAuthPath(url.pathname)) {
      return "/";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function isReservedAuthPath(pathname: string): boolean {
  return [SIGN_IN_PATH, SIGN_OUT_PATH, CALLBACK_PATH].includes(pathname);
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
