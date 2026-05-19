export const prerender = false;

import type { APIRoute } from 'astro';
import { checkRateLimit } from '../../lib/db';

// 問い合わせフォームの内容を Discord Webhook へ投稿する。
export const POST: APIRoute = async ({ request, locals, redirect, clientAddress }) => {
  const env = locals.runtime.env;
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const discord = String(form.get('discord') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const honeypot = String(form.get('company') ?? '').trim();
  const locale = form.get('locale') === 'en' ? 'en' : 'ja';
  const consultingPath = locale === 'en' ? '/en/tsunagu' : '/tsunagu';

  if (!name || !message) {
    return redirect(`${consultingPath}?contact=required#contact`, 303);
  }
  // ハニーポットに入力があればボット。成功と同じ応答を返して握りつぶす。
  if (honeypot) {
    return redirect(`${consultingPath}?contact=ok#contact`, 303);
  }
  const ok = await checkRateLimit(env.DB, `contact:${clientAddress}`, 5, 3600);
  if (!ok) {
    return redirect(`${consultingPath}?contact=ok#contact`, 303);
  }

  const lines = [
    '**新しい問い合わせ — tsunagi Consulting**',
    `**お名前 / 屋号:** ${name}`,
    email ? `**メール:** ${email}` : null,
    discord ? `**Discord:** ${discord}` : null,
    `**言語:** ${locale}`,
    '',
    message,
  ].filter((l): l is string => l !== null);
  const content = lines.join('\n').slice(0, 1900);

  try {
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tsunagi web', content }),
    });
    if (!res.ok) throw new Error(`discord ${res.status}`);
  } catch {
    return redirect(`${consultingPath}?contact=error#contact`, 303);
  }

  return redirect(`${consultingPath}?contact=ok#contact`, 303);
};

export const GET: APIRoute = ({ redirect }) => redirect('/tsunagu', 303);
