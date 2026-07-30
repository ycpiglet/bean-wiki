type DevAuthEnvironment = {
  NODE_ENV?: string;
  BEAN_WIKI_DEV_AUTH?: string;
  BEAN_WIKI_DEV_EMAIL?: string;
  BEAN_WIKI_DEV_NAME?: string;
};

function enabled(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

export function devAuthConfigured(
  env: DevAuthEnvironment = process.env,
): boolean {
  return env.NODE_ENV === "development" && enabled(env.BEAN_WIKI_DEV_AUTH);
}

export function devAuthIdentity(env: DevAuthEnvironment = process.env): {
  email: string;
  name: string;
} {
  const email =
    env.BEAN_WIKI_DEV_EMAIL?.trim().toLowerCase() || "developer@bean.wiki";
  const name = env.BEAN_WIKI_DEV_NAME?.trim() || "Bean Wiki Developer";
  return { email, name };
}
