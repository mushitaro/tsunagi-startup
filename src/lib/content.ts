// コンテンツコレクションのアクセスヘルパー。
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

export type AppEntry = CollectionEntry<'apps'>;
export type ArticleEntry = CollectionEntry<'articles'>;
export type ConsultingEntry = CollectionEntry<'consulting'>;

const showDrafts = import.meta.env.DEV;

/** articles / consulting の id は "<locale>/<slug>" 形式。 */
export function entryLocale(id: string): Locale {
  return id.startsWith('en/') ? 'en' : 'ja';
}
/** id からロケールプレフィックスを除いた slug（購入権キー兼ルートパラメータ）。 */
export function entrySlug(id: string): string {
  return id.replace(/^(ja|en)\//, '');
}

/** 日英併記フィールドから現在ロケールの値を取り出す。 */
export function pick(field: string | { ja: string; en: string }, locale: Locale): string {
  if (typeof field === 'string') return field;
  return field[locale] ?? field.ja;
}

/** アプリの名前を製品の字体で出すための style 属性の値。 */
export function nameFontStyle(app: AppEntry): string | undefined {
  const f = app.data.nameFont;
  if (!f) return undefined;
  const parts = [`font-family:'${f.family}',var(--font-sans)`, `font-weight:${f.weight}`];
  if (f.tracking) parts.push(`letter-spacing:${f.tracking}`);
  return parts.join(';');
}

/** 名前の字体を読み込む Google Fonts の URL。名前に出る字だけを取り寄せる（text=）。 */
export function nameFontsHref(apps: AppEntry[]): string | undefined {
  const families = new Map<string, Set<number>>();
  let text = '';
  for (const app of apps) {
    const f = app.data.nameFont;
    if (!f) continue;
    families.set(f.family, (families.get(f.family) ?? new Set()).add(f.weight));
    text += app.data.name.ja + app.data.name.en;
  }
  if (families.size === 0) return undefined;
  const query = [...families]
    .map(([family, weights]) => `family=${family.replace(/ /g, '+')}:wght@${[...weights].sort((a, b) => a - b).join(';')}`)
    .join('&');
  const chars = encodeURIComponent([...new Set(text)].join(''));
  return `https://fonts.googleapis.com/css2?${query}&text=${chars}&display=swap`;
}

/* ── Catalog（apps） ─────────────────────────────── */
export async function getApps(): Promise<AppEntry[]> {
  const apps = await getCollection('apps');
  return apps.sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    // order は小さいほど上（先頭）に並べる（表示番号 01, 02, … と一致させる）
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return a.id.localeCompare(b.id);
  });
}

export async function getApp(slug: string): Promise<AppEntry | undefined> {
  const apps = await getCollection('apps');
  return apps.find((a) => a.id === slug);
}

/* ── Content（articles） ─────────────────────────── */
export async function getArticles(locale: Locale): Promise<ArticleEntry[]> {
  const all = await getCollection(
    'articles',
    ({ id, data }) => entryLocale(id) === locale && (!data.draft || showDrafts),
  );
  return all.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getArticle(locale: Locale, slug: string): Promise<ArticleEntry | undefined> {
  const all = await getCollection('articles');
  return all.find(
    (e) =>
      entryLocale(e.id) === locale &&
      entrySlug(e.id) === slug &&
      (!e.data.draft || showDrafts),
  );
}

/** 別ロケールの同一 slug 記事が存在すれば返す（言語切替用）。 */
export async function getArticleTranslation(
  slug: string,
  to: Locale,
): Promise<ArticleEntry | undefined> {
  return getArticle(to, slug);
}

/* ── Consulting ─────────────────────────────────── */
export async function getConsulting(locale: Locale): Promise<ConsultingEntry[]> {
  const all = await getCollection(
    'consulting',
    ({ id, data }) => entryLocale(id) === locale && (!data.draft || showDrafts),
  );
  return all.sort((a, b) => a.data.order - b.data.order);
}

/* ── 表示ユーティリティ ─────────────────────────── */
export function formatDate(d: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatPrice(amount: number, currency = 'jpy'): string {
  if (currency.toLowerCase() === 'jpy') return `¥${amount.toLocaleString('ja-JP')}`;
  return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
}
