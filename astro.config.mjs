import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://freighter.online',
  output: 'hybrid',
  adapter: vercel(),
});
