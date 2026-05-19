import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://freighter.online',
  output: 'static',
  adapter: vercel(),
});
