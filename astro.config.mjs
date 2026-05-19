import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://freighter.online',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [sitemap()],
});
