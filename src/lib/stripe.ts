// Stripe REST API を fetch で直接呼ぶ軽量クライアント。
// Stripe Node SDK は CJS が重く Workers ビルドランナーと相性が悪いため使わない。

const API = 'https://api.stripe.com/v1';
const encoder = new TextEncoder();

export interface CheckoutSession {
  id: string;
  url: string | null;
  payment_status: string;
  payment_intent: string | null;
  amount_total: number | null;
  currency: string | null;
  client_reference_id: string | null;
  customer_email: string | null;
  customer_details: { email: string | null } | null;
  metadata: Record<string, string> | null;
}

async function stripeRequest<T>(
  secretKey: string,
  path: string,
  method: 'GET' | 'POST',
  body?: URLSearchParams,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body?.toString(),
  });
  const data = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(`Stripe ${path} ${res.status}: ${data?.error?.message ?? 'request failed'}`);
  }
  return data;
}

/** ワンタイム決済の Checkout セッションを作成する。 */
export async function createCheckoutSession(
  secretKey: string,
  args: {
    productName: string;
    currency: string;
    unitAmount: number;
    customerEmail: string;
    clientReferenceId: string;
    metadata: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
  },
): Promise<CheckoutSession> {
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', args.successUrl);
  body.set('cancel_url', args.cancelUrl);
  body.set('customer_email', args.customerEmail);
  body.set('client_reference_id', args.clientReferenceId);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', args.currency);
  body.set('line_items[0][price_data][unit_amount]', String(args.unitAmount));
  body.set('line_items[0][price_data][product_data][name]', args.productName);
  for (const [k, v] of Object.entries(args.metadata)) {
    body.set(`metadata[${k}]`, v);
  }
  return stripeRequest<CheckoutSession>(secretKey, '/checkout/sessions', 'POST', body);
}

/** Checkout セッションを取得する（決済復帰時の検証に使用）。 */
export async function retrieveCheckoutSession(
  secretKey: string,
  id: string,
): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(
    secretKey,
    `/checkout/sessions/${encodeURIComponent(id)}`,
    'GET',
  );
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Webhook 署名を検証し、検証済みなら JSON パース済みイベントを返す（不正なら null）。
 * Stripe の署名スキーム: signed_payload = `${t}.${rawBody}` を webhook secret で HMAC-SHA256。
 */
export async function verifyWebhookEvent(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
  toleranceSec = 300,
): Promise<{ type: string; data: { object: CheckoutSession } } | null> {
  if (!signatureHeader) return null;
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => kv.split('=').map((s) => s.trim()) as [string, string]),
  );
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) return null;

  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return null;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${t}.${rawBody}`));
  if (!timingSafeEqual(hex(sig), v1)) return null;

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}
