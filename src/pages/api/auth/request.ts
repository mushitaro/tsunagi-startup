export const prerender = false;

import type { APIRoute } from 'astro';
import {
  isValidEmail,
  normalizeEmail,
  generateMagicToken,
  hashToken,
  MAGIC_LINK_TTL_SEC,
} from '../../../lib/auth';
import { createAuthToken, countRecentAuthTokens, checkRateLimit } from '../../../lib/db';
import { sendEmail, magicLinkEmail } from '../../../lib/email';

// メールアドレスを受け取り、マジックリンクを送信する。
export const POST: APIRoute = async ({ request, locals, redirect, clientAddress }) => {
  const env = locals.runtime.env;
  const form = await request.formData();
  const email = normalizeEmail(String(form.get('email') ?? ''));
  const locale = form.get('locale') === 'en' ? 'en' : 'ja';
  const next = String(form.get('next') ?? '');
  const accountPath = locale === 'en' ? '/en/account' : '/account';
  const withNext = next ? `&next=${encodeURIComponent(next)}` : '';

  if (!isValidEmail(email)) {
    return redirect(`${accountPath}?error=1${withNext}`, 303);
  }

  // レート制限: IP単位 / メール単位。超過時も「送信済み」と同じ応答で列挙を防ぐ。
  const ipOk = await checkRateLimit(env.DB, `authreq:${clientAddress}`, 12, 3600);
  const recent = await countRecentAuthTokens(env.DB, email, 60 * 60 * 1000);
  if (!ipOk || recent >= 5) {
    return redirect(`${accountPath}?sent=1`, 303);
  }

  const token = generateMagicToken();
  const tokenHash = await hashToken(token);
  await createAuthToken(env.DB, tokenHash, email, Date.now() + MAGIC_LINK_TTL_SEC * 1000);

  const verifyUrl = new URL('/api/auth/verify', env.PUBLIC_SITE_URL);
  verifyUrl.searchParams.set('token', token);
  verifyUrl.searchParams.set('locale', locale);
  if (next) verifyUrl.searchParams.set('next', next);

  const mail = magicLinkEmail(locale, verifyUrl.toString());
  await sendEmail({
    apiKey: env.RESEND_API_KEY,
    from: env.RESEND_FROM,
    to: email,
    subject: mail.subject,
    html: mail.html,
  });

  return redirect(`${accountPath}?sent=1`, 303);
};

// フォーム POST 専用。
export const GET: APIRoute = ({ redirect }) => redirect('/account', 303);
