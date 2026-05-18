export const prerender = false;

import type { APIRoute } from 'astro';
import {
  hashToken,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '../../../lib/auth';
import { consumeAuthToken, upsertUserByEmail } from '../../../lib/db';

// マジックリンクのトークンを検証し、セッション Cookie を発行する。
export const GET: APIRoute = async ({ url, locals, cookies, redirect }) => {
  const env = locals.runtime.env;
  const token = url.searchParams.get('token');
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'ja';
  const next = url.searchParams.get('next') ?? '';
  const accountPath = locale === 'en' ? '/en/account' : '/account';

  if (!token) return redirect(`${accountPath}?verify=fail`, 303);

  const tokenHash = await hashToken(token);
  const email = await consumeAuthToken(env.DB, tokenHash);
  if (!email) return redirect(`${accountPath}?verify=fail`, 303);

  const user = await upsertUserByEmail(env.DB, email);
  const sessionToken = await createSessionToken(
    { id: user.id, email: user.email },
    env.SESSION_SECRET,
  );
  cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());

  // next は同一オリジンの相対パスのみ許可（オープンリダイレクト対策）。
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '';
  return redirect(safeNext || `${accountPath}?verify=ok`, 303);
};
