// JSON-LD 構造化データのビルダー（SEO / AIO 用）。
import type { Locale } from '../i18n';

export const SITE_URL = 'https://tsunagi.app';
const inLang = (l: Locale) => (l === 'ja' ? 'ja-JP' : 'en-US');

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'tsunagi',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description:
      'アプリのカタログ、開発ノウハウのコンテンツ、開発・運用コンサルティングを提供する tsunagi.app プロジェクト。',
  };
}

export function websiteSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'tsunagi',
    url: SITE_URL,
    inLanguage: inLang(locale),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function articleSchema(a: {
  headline: string;
  description: string;
  url: string;
  locale: Locale;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
  isPaid: boolean;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    url: a.url,
    inLanguage: inLang(a.locale),
    datePublished: a.datePublished.toISOString(),
    dateModified: (a.dateModified ?? a.datePublished).toISOString(),
    author: { '@type': 'Organization', name: 'tsunagi' },
    publisher: organizationSchema(),
  };
  if (a.image) schema.image = a.image;
  // 有料記事はプレビュー（summary）のみ無料、本文は要購入であることを明示。
  if (a.isPaid) {
    schema.isAccessibleForFree = false;
    schema.hasPart = {
      '@type': 'WebPageElement',
      isAccessibleForFree: false,
      cssSelector: '.article-body',
    };
  } else {
    schema.isAccessibleForFree = true;
  }
  return schema;
}

export function softwareApplicationSchema(a: {
  name: string;
  description: string;
  url: string;
  appUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: a.name,
    description: a.description,
    url: a.appUrl ?? a.url,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    publisher: { '@type': 'Organization', name: 'tsunagi' },
  };
}

export function serviceSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: locale === 'ja' ? 'tsunagi 開発コンサルティング' : 'tsunagi development consulting',
    url: `${SITE_URL}${locale === 'ja' ? '' : '/en'}/tsunagu`,
    description:
      locale === 'ja'
        ? 'アプリのデザイン・開発・運用を受託するコンサルティングサービス。'
        : 'Consulting services for app design, development, and operations.',
    provider: organizationSchema(),
    areaServed: 'JP',
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}
