export const prerender = false;

import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth';

// セッション Cookie を破棄してアカウントページへ戻す。
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  const form = await request.formData().catch(() => null);
  const locale = form?.get('locale') === 'en' ? 'en' : 'ja';
  return redirect(locale === 'en' ? '/en/account' : '/account', 303);
};
