export type PlatformHeaderTrustConfig = {
  AUTH_TRUST_PLATFORM_HEADERS?: string;
  PLATFORM_GATEWAY_SECRET?: string;
};

export function platformHeaderTrustConfigured(
  config: PlatformHeaderTrustConfig,
): boolean {
  const optIn = config.AUTH_TRUST_PLATFORM_HEADERS?.trim().toLowerCase();
  const secret = config.PLATFORM_GATEWAY_SECRET;

  return (
    (optIn === "1" || optIn === "true") &&
    Boolean(secret && secret.length >= 16)
  );
}
