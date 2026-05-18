// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';

// startup.tsunagi.app を入り口とする統合サイト。
// ja を既定ロケール（プレフィックスなし）、en を /en/ 配下に配置。
export default defineConfig({
  site: 'https://startup.tsunagi.app',
  adapter: cloudflare({
    // astro dev で D1 などの Cloudflare バインディングを利用可能にする。
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // サイトマップは SSR の記事ページも含めるため src/pages/sitemap.xml.ts で自前生成する。
  integrations: [mdx()],
});
