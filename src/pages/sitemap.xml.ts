export const prerender = true;

import type { APIContext } from 'astro';
import type { Locale } from '../i18n';
import { getApps, getArticles, entrySlug } from '../lib/content';

// 全 URL（SSR の記事ページ含む）を hreflang 代替つきで列挙するサイトマップ。
export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL('https://startup.tsunagi.app')).origin;

  const pages: { path: string; locales: Locale[] }[] = [
    { path: '/', locales: ['ja', 'en'] },
    { path: '/catalog', locales: ['ja', 'en'] },
    { path: '/content', locales: ['ja', 'en'] },
    { path: '/consulting', locales: ['ja', 'en'] },
    { path: '/privacy', locales: ['ja', 'en'] },
    { path: '/terms', locales: ['ja', 'en'] },
  ];

  for (const a of await getApps()) {
    pages.push({ path: `/catalog/${a.id}`, locales: ['ja', 'en'] });
  }

  // 記事は実在するロケールのみ列挙する。
  const slugLocales = new Map<string, Locale[]>();
  for (const a of await getArticles('ja')) {
    slugLocales.set(entrySlug(a.id), ['ja']);
  }
  for (const a of await getArticles('en')) {
    const s = entrySlug(a.id);
    slugLocales.set(s, [...(slugLocales.get(s) ?? []), 'en']);
  }
  for (const [slug, locales] of slugLocales) {
    pages.push({ path: `/content/${slug}`, locales });
  }

  const urlFor = (path: string, loc: Locale) =>
    origin + (loc === 'ja' ? path : path === '/' ? '/en' : `/en${path}`);

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
