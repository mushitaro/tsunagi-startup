// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// tsunagi.app（apex）を入り口とする統合サイト。
// 静的ビルドして GitHub Pages で公開する（サーバー機能なし）。
// ja を既定ロケール（プレフィックスなし）、en を /en/ 配下に配置。
export default defineConfig({
  site: 'https://tsunagi.app',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // サイトマップは src/pages/sitemap.xml.ts で自前生成する。
  integrations: [mdx()],
});
