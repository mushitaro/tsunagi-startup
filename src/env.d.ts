/// <reference types="astro/client" />

// Cloudflare バインディング / シークレットの型。
// 値は wrangler.jsonc（vars / d1）と Worker シークレット（wrangler secret put）由来。
interface CfEnv {
  DB: D1Database;
  // vars（wrangler.jsonc・非機密）
  PUBLIC_SITE_URL: string;
  RESEND_FROM: string;
  DISCORD_INVITE_URL: string;
  // secrets（wrangler secret put / ローカルは .dev.vars）
  SESSION_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  DISCORD_WEBHOOK_URL: string;
}

// @astrojs/cloudflare v12: バインディングは Astro.locals.runtime.env からアクセスする。
type CfRuntime = import('@astrojs/cloudflare').Runtime<CfEnv>;

declare namespace App {
  interface Locals extends CfRuntime {
    user: import('./lib/auth').SessionUser | null;
  }
}
