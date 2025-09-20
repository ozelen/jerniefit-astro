// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap(), react()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-hook-form'],
    },
    ssr: {
      noExternal: ['react-hook-form'],
    },
  },
  output: 'server',
});
