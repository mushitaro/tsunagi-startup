export const prerender = true;

import type { APIContext } from 'astro';
import type { Locale } from '../i18n';
import { getApps } from '../lib/content';

// 全 URL（SSR の記事ページ含む）を hreflang 代替つきで列挙するサイトマップ。
export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL('https://tsunagi.app')).origin;

  // TSUTAERU / TSUNAGU は現在非公開（準備中）のためサイトマップから除外している。
  const pages: { path: string; locales: Locale[] }[] = [
    { path: '/', locales: ['ja', 'en'] },
    { path: '/tsukuru', locales: ['ja', 'en'] },
    { path: '/privacy', locales: ['ja', 'en'] },
    { path: '/terms', locales: ['ja', 'en'] },
  ];

  for (const a of await getApps()) {
    pages.push({ path: `/tsukuru/${a.id}`, locales: ['ja', 'en'] });
  }

  // canonical はディレクトリ形式（末尾スラッシュ付き）なので URL を揃える。ルートはそのまま。
  const withSlash = (p: string) => (p === '/' || p.endsWith('/') ? p : `${p}/`);
  const urlFor = (path: string, loc: Locale) =>
    origin + withSlash(loc === 'ja' ? path : path === '/' ? '/en' : `/en${path}`);

  const urls = pages.flatMap((pg) =>
    pg.locales.map((loc) => {
      const alts = pg.locales
        .map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(pg.path, l)}"/>`)
        .join('');
      const xdefault = pg.locales.includes('ja')
        ? `<xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(pg.path, 'ja')}"/>`
        : '';
      return `  <url><loc>${urlFor(pg.path, loc)}</loc>${alts}${xdefault}</url>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
