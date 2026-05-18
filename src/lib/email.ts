// Resend によるトランザクションメール送信（マジックリンク / 購入レシート）。
import type { Locale } from '../i18n';

interface SendArgs {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(args: SendArgs): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function shell(title: string, bodyHtml: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#fafafa;font-family:-apple-system,'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif;color:#0a0a0a">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px">
    <div style="font-weight:800;font-size:20px;letter-spacing:-0.02em;margin-bottom:24px">tsunagi</div>
    <div style="background:#fff;border:1px solid #e6e6e6;border-radius:14px;padding:28px">
      <h1 style="margin:0 0 12px;font-size:18px">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="color:#a3a3a3;font-size:12px;margin-top:20px;line-height:1.7">${footer}</p>
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:9px;font-weight:700;font-size:15px">${label}</a>`;
}

export function magicLinkEmail(locale: Locale, url: string): { subject: string; html: string } {
  if (locale === 'en') {
    return {
      subject: 'Your tsunagi sign-in link',
      html: shell(
        'Sign in to tsunagi',
        `<p style="color:#404040;line-height:1.8;font-size:15px">Click the button below to sign in. This link expires in 30 minutes and can be used once.</p>
         <p style="margin:22px 0">${button(url, 'Sign in')}</p>
         <p style="color:#a3a3a3;font-size:13px">If you did not request this, you can ignore this email.</p>`,
        'tsunagi · startup.tsunagi.app',
      ),
    };
  }
  return {
    subject: 'tsunagi ログインリンク',
    html: shell(
      'tsunagi にログイン',
      `<p style="color:#404040;line-height:1.9;font-size:15px">下のボタンからログインを完了してください。このリンクの有効期限は30分で、一度だけ使用できます。</p>
       <p style="margin:22px 0">${button(url, 'ログインする')}</p>
       <p style="color:#a3a3a3;font-size:13px">心当たりがない場合はこのメールを破棄してください。</p>`,
      'tsunagi · startup.tsunagi.app',
    ),
  };
}

export function receiptEmail(
  locale: Locale,
  args: { title: string; amount: number; currency: string; url: string },
): { subject: string; html: string } {
  const price = `${args.currency.toUpperCase()} ${args.amount.toLocaleString()}`;
  if (locale === 'en') {
    return {
      subject: `Receipt — ${args.title}`,
      html: shell(
        'Thank you for your purchase',
        `<p style="color:#404040;line-height:1.8;font-size:15px"><strong>${args.title}</strong><br>${price}</p>
         <p style="margin:22px 0">${button(args.url, 'Read the article')}</p>
         <p style="color:#a3a3a3;font-size:13px">You can read this article anytime while signed in.</p>`,
        'tsunagi · startup.tsunagi.app',
      ),
    };
  }
  return {
    subject: `ご購入ありがとうございます — ${args.title}`,
    html: shell(
      'ご購入ありがとうございます',
      `<p style="color:#404040;line-height:1.9;font-size:15px"><strong>${args.title}</strong><br>${price}</p>
       <p style="margin:22px 0">${button(args.url, '記事を読む')}</p>
       <p style="color:#a3a3a3;font-size:13px">ログイン中はいつでもこの記事を読めます。</p>`,
      'tsunagi · startup.tsunagi.app',
    ),
  };
}
