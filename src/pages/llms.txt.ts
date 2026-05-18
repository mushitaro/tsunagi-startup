export const prerender = true;

import type { APIContext } from 'astro';
import { getApps, getArticles, getConsulting, pick, entrySlug } from '../lib/content';

// AIO（生成AI最適化）: LLM 向けにサイト全体の目次を提供する。
// コンテンツ追加時にビルドで自動更新される。
export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL('https://startup.tsunagi.app')).origin;
  const apps = await getApps();
  const articles = await getArticles('ja');
  const consulting = await getConsulting('ja');

  const lines: string[] = [
    '# tsunagi',
    '',
    '> アプリのカタログ、開発ノウハウのコンテンツ、開発・運用コンサルティングを一か所に集約した tsunagi.app プロジェクトの統合サイト。',
    '',
    'tsunagi は Catalog（プロダクト）/ Content（記事）/ Consulting（開発受託）の3セクションで構成される。日本語を既定とし、英語版は各 URL の `/en/` 配下にある。',
    '',
    '## Catalog — プロダクト',
  ];
  for (const a of apps) {
    lines.push(
      `- [${pick(a.data.name, 'ja')}](${origin}/catalog/${a.id}): ${pick(a.data.tagline, 'ja')}`,
    );
  }
  lines.push('', '## Content — 記事');
  for (const a of articles) {
    const paid = a.data.access === 'paid' ? '（有料）' : '';
    lines.push(
      `- [${a.data.title}](${origin}/content/${entrySlug(a.id)})${paid}: ${a.data.summary}`,
    );
  }
  lines.push('', '## Consulting — 開発受託');
  lines.push(
    `tsunagi のプロダクト開発で培った知見で、アプリのデザイン・開発・運用を受託する。問い合わせは Discord に特化。詳細: ${origin}/consulting`,
  );
  for (const c of consulting) {
    lines.push(`- ${c.data.title}: ${c.data.summary}`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
