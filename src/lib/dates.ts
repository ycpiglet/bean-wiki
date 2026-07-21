// The site stores dates as "YYYY. MM. DD." display strings. These helpers turn
// them into real Dates / ISO strings for sitemap lastmod, <time datetime>, feeds,
// and JSON-LD — deterministically (no new Date() that drifts every build).

export function parseKoreanDate(value: string): Date {
  const parts = value.match(/\d+/g);
  if (!parts || parts.length < 3) return new Date(0);
  return new Date(
    Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
  );
}

export function toISODate(value: string): string | undefined {
  const parts = value.match(/\d+/g);
  if (!parts || parts.length < 3) return undefined;
  return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
}
