export const prerender = false;

import type { APIRoute } from 'astro';
import { getArticle } from '../../lib/content';
import { createCheckoutSession } from '../../lib/stripe';

// 有料記事の Stripe Checkout セッションを作成し、決済ページへリダイレクトする。
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  const form = await request.formData();
  const slug = String(form.get('slug') ?? '');
  const locale = form.get('locale') === 'en' ? 'en' : 'ja';
  const articlePath = locale === 'en' ? `/en/tsutae/${slug}` : `/tsutae/${slug}`;

  // 未ログインならログインへ（戻り先に記事を指定）。
  if (!user) {
    const accountPath = locale === 'en' ? '/en/account' : '/account';
    return redirect(`${accountPath}?next=${encodeURIComponent(articlePath)}`, 303);
  }

  const article = await getArticle(locale, slug);
  if (!article || article.data.access !== 'paid' || !article.data.price) {
    return new Response('Not purchasable', { status: 400 });
  }

  const site = env.PUBLIC_SITE_URL;
  try {
    const session = await createCheckoutSession(env.STRIPE_SECRET_KEY, {
      productName: article.data.title,
      currency: article.data.currency || 'jpy',
      unitAmount: article.data.price,
      customerEmail: user.email,
      clientReferenceId: user.id,
      metadata: { article_slug: slug, user_id: user.id, locale },
      successUrl: `${site}${articlePath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${site}${articlePath}?checkout=cancel`,
    });
    if (!session.url) return new Response('Checkout error', { status: 502 });
    return redirect(session.url, 303);
  } catch {
    return new Response('Checkout error', { status: 502 });
  }
};

export const GET: APIRoute = ({ redirect }) => redirect('/tsutae', 303);
