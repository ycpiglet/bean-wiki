import type { NextConfig } from "next";
import redirectMap from "./src/content/redirects.json";

// Article renames record old-slug -> new-slug in src/content/redirects.json
// (written by the rename API). Emit a 301 for both locales so old links and
// bookmarks keep working.
const slugRedirects = Object.entries(redirectMap as Record<string, string>).flatMap(
  ([from, to]) => [
    { source: `/wiki/${from}`, destination: `/wiki/${to}`, permanent: true },
    { source: `/en/wiki/${from}`, destination: `/en/wiki/${to}`, permanent: true },
  ],
);

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return slugRedirects;
  },
};

export default nextConfig;
