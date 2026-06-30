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
export function pick(field: { ja: string; en: string }, locale: Locale): string {
  return field[locale] ?? field.ja;
}

/* ── Catalog（apps） ─────────────────────────────── */
export async function getApps(): Promise<AppEntry[]> {
  const apps = await getCollection('apps');
  return apps.sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    // order は大きいほど上（先頭）に並べる
    if (a.data.order !== b.data.order) return b.data.order - a.data.order;
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
