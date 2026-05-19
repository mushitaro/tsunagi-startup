import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getArticles, entrySlug } from '../lib/content';

export const prerender = true;

// コンテンツ（記事）の RSS フィード。
// 有料記事も含めるが、本文は出さず summary（無料プレビュー）のみ配信する。
export async function GET(context: APIContext) {
  const articles = await getArticles('ja');
  return rss({
    title: 'tsunagi Content',
    description: 'アプリ開発・運用・コンサルティングのアプローチ — tsunagi',
    site: context.site ?? 'https://startup.tsunagi.app',
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.summary,
      pubDate: a.data.publishedAt,
      link: `/tsutaeru/${entrySlug(a.id)}`,
      categories: a.data.tags,
    })),
    customData: '<language>ja-JP</language>',
  });
}
