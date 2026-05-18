export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyWebhookEvent } from '../../lib/stripe';
import { upsertUserByEmail, recordPurchase } from '../../lib/db';
import { getArticle } from '../../lib/content';
import { sendEmail, receiptEmail } from '../../lib/email';

// Stripe Webhook: 決済完了で購入権を D1 に記録し、レシートを送る。
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  const event = await verifyWebhookEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!event) return new Response('Invalid signature', { status: 400 });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email ?? session.customer_details?.email ?? null;
    const slug = session.metadata?.article_slug;
    const locale = session.metadata?.locale === 'en' ? 'en' : 'ja';

    if (session.payment_status === 'paid' && slug && email) {
      const user = await upsertUserByEmail(env.DB, email.toLowerCase());
      const inserted = await recordPurchase(env.DB, {
        userId: user.id,
        articleSlug: slug,
        stripeSessionId: session.id,
        stripePaymentIntent: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
      });

      // 新規購入時のみレシートを送る（重複 Webhook で二重送信しない）。
      if (inserted && session.amount_total != null) {
        const article = await getArticle(locale, slug);
        if (article) {
          const url = `${env.PUBLIC_SITE_URL}${locale === 'en' ? '/en' : ''}/content/${slug}`;
          const mail = receiptEmail(locale, {
            title: article.data.title,
            amount: session.amount_total,
            currency: session.currency ?? 'jpy',
            url,
          });
          await sendEmail({
            apiKey: env.RESEND_API_KEY,
            from: env.RESEND_FROM,
            to: email,
            subject: mail.subject,
            html: mail.html,
          });
        }
      }
    }
  }

  return new Response('ok', { status: 200 });
};
