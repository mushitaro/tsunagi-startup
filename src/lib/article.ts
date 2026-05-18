// 記事の購入権判定（SSR ページ content/[slug] から利用）。
import type { Locale } from '../i18n';
import type { SessionUser } from './auth';
import { type ArticleEntry, getArticle } from './content';
import { hasPurchased, recordPurchase } from './db';
import { retrieveCheckoutSession } from './stripe';

interface Options {
  env: CfEnv;
  locale: Locale;
  slug: string;
  user: SessionUser | null;
  /** ?checkout=success&session_id=... の session_id（あれば webhook を待たず確定する） */
  checkoutSessionId: string | null;
}

export async function getArticleEntitlement(
  opts: Options,
): Promise<{ article: ArticleEntry; entitled: boolean } | null> {
  const { env } = opts;
  const article = await getArticle(opts.locale, opts.slug);
  if (!article) return null;

  const paid = article.data.access === 'paid';
  if (!paid) return { article, entitled: true };
  if (!opts.user) return { article, entitled: false };

  // Stripe Checkout からの復帰時はその場で購入権を記録する（冪等）。
  if (opts.checkoutSessionId) {
    try {
      const session = await retrieveCheckoutSession(env.STRIPE_SECRET_KEY, opts.checkoutSessionId);
      if (
        session.payment_status === 'paid' &&
        session.metadata?.article_slug === opts.slug &&
        session.client_reference_id === opts.user.id
      ) {
        await recordPurchase(env.DB, {
          userId: opts.user.id,
          articleSlug: opts.slug,
          stripeSessionId: session.id,
          stripePaymentIntent:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
          amount: session.amount_total ?? null,
          currency: session.currency ?? null,
        });
      }
    } catch {
      // 失敗しても webhook 側で確定されるため握りつぶす。
    }
  }

  const entitled = await hasPurchased(env.DB, opts.user.id, opts.slug);
  return { article, entitled };
}
