// Single source of truth for the production origin. Override at build/deploy
// with NEXT_PUBLIC_SITE_URL (e.g. when attaching a custom domain) so metadata,
// sitemap, robots, and feed all stay coherent — see DEPLOY.md.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bean-wiki.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Bean Wiki";
export const SITE_DESCRIPTION =
  "초심자부터 바리스타, 로스터, Q 그레이더까지 함께 만들고 배우는 열린 커피 백과사전.";
