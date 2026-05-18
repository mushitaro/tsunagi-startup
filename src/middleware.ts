import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

// セッション Cookie を検証し locals.user を確定する。
// プリレンダリング済みルート（ビルド時実行）ではバインディングが無いためスキップする。
export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;

  if (context.isPrerendered) {
    return next();
  }

  const env = context.locals.runtime?.env;
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  if (env && token) {
    try {
      context.locals.user = await verifySessionToken(token, env.SESSION_SECRET);
    } catch {
      context.locals.user = null;
    }
  }

  return next();
});
