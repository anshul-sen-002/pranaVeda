import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /**
   * Every PranaVeda page is driven by live API calls (content, taxonomy,
   * auth), so the app renders per request rather than from a prerendered
   * cache. `cacheComponents` would require a Suspense/use-cache boundary on
   * every one of those fetches — including generateMetadata, which cannot be
   * suspended — so we keep it off.
   */
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  /**
   * Featured images / cover art are stored on Cloudinary (see media module).
   * Allow the Next image optimizer to fetch from our Cloudinary account so
   * <Image> gets responsive srcsets instead of the raw bytes.
   */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
