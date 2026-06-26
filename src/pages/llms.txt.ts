export const prerender = true;

import type { APIContext } from 'astro';
import { getApps, pick } from '../lib/content';

// AIO（生成AI最適化）: LLM 向けにサイト全体の目次を提供する。
// コンテンツ追加時にビルドで自動更新される。
export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL('https://tsunagi.app')).origin;
  const apps = await getApps();

  const lines: string[] = [
    '# tsunagi',
    '',
    '> tsunagi.app プロジェクトのプロダクト（アプリ）ポートフォリオ。',
    '',
    'tsunagi のプロダクトを Catalog としてまとめている。日本語を既定とし、英語版は各 URL の `/en/` 配下にある。',
    '',
    '## Catalog — プロダクト',
  ];
  for (const a of apps) {
    lines.push(
      `- [${pick(a.data.name, 'ja')}](${origin}/tsukuru/${a.id}): ${pick(a.data.tagline, 'ja')}`,
    );
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
