// 日英バイリンガルの UI 文言とロケールユーティリティ。
// ja を既定（プレフィックスなし）、en を /en/ 配下に置く。

export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

export const localeLabel: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
};

export const ui = {
  ja: {
    'site.name': 'tsunagi',
    'site.tagline': 'つくる・つたえる・つなぐ',

    'nav.catalog': 'Catalog',
    'nav.content': 'Content',
    'nav.consulting': 'Consulting',
    'nav.account': 'アカウント',
    'nav.menu': 'メニュー',
    'nav.skip': '本文へスキップ',

    'home.hero.kicker': 'tsunagi.app プロジェクト',
    'home.hero.title': 'アプリをつくり、知見をつたえ、人とつなぐ。',
    'home.hero.lead':
      'tsunagi は個人開発のアプリ群と、その設計・開発・運用の知見を一か所に集約したプロジェクトです。プロダクトのカタログ、有料・無料のコンテンツ、開発受託のご相談までをここから。',
    'home.hero.cta.catalog': 'カタログを見る',
    'home.hero.cta.consulting': '開発を相談する',

    'home.section.catalog.title': 'Catalog — プロダクト一覧',
    'home.section.catalog.desc':
      'tsunagi.app ドメインで公開中のアプリと、開発中のプロジェクトをまとめています。',
    'home.section.content.title': 'Content — 記事・ノウハウ',
    'home.section.content.desc':
      'アプリ開発・運用・コンサルティングのアプローチを記事として公開。一部は有料記事です。',
    'home.section.consulting.title': 'Consulting — 開発受託',
    'home.section.consulting.desc':
      'アプリのデザイン・開発・運用を受託します。お問い合わせは Discord に特化しています。',
    'home.section.more': '詳しく見る',

    'catalog.title': 'Catalog',
    'catalog.lead': 'tsunagi のプロダクトと開発中プロジェクト。',
    'catalog.filter.all': 'すべて',
    'catalog.empty': '該当するプロダクトはありません。',
    'catalog.visit': 'アプリを開く',
    'catalog.repo': 'リポジトリ',
    'catalog.back': 'Catalog に戻る',

    'content.title': 'Content',
    'content.lead': 'アプリ開発と運用、コンサルティングのアプローチ。',
    'content.empty': '記事はまだありません。',
    'content.readmore': '続きを読む',
    'content.back': 'Content に戻る',
    'content.published': '公開',
    'content.updated': '更新',
    'content.related': '関連記事',
    'content.toc': '目次',

    'consulting.title': 'Consulting',
    'consulting.lead':
      'tsunagi のプロダクト開発で培った知見で、アプリのデザイン・開発・運用を受託します。',
    'consulting.contact.title': 'Discord で相談する',
    'consulting.contact.desc':
      'お問い合わせは Discord に特化しています。サーバーに参加して直接ご相談いただくか、下のフォームからご連絡ください。',
    'consulting.contact.join': 'Discord サーバーに参加',

    'access.free': '無料',
    'access.paid': '有料',
    'paywall.title': 'この続きは有料記事です',
    'paywall.desc': '購入すると全文をいつでも、複数の端末から読めます。',
    'paywall.price': '価格',
    'paywall.buy': '購入して読む',
    'paywall.owned': '購入済み — 全文を表示しています',
    'paywall.login.note': '購入・閲覧にはログインが必要です。',
    'paywall.login.cta': 'ログイン / 新規登録',

    'auth.title': 'ログイン / 新規登録',
    'auth.lead':
      'メールアドレスを入力してください。ログイン用リンクをお送りします（パスワード不要）。',
    'auth.email': 'メールアドレス',
    'auth.send': 'ログインリンクを送る',
    'auth.sent.title': 'メールを送信しました',
    'auth.sent.desc': '届いたメール内のリンクを開くとログインが完了します。',
    'auth.account.title': 'アカウント',
    'auth.account.email': 'ログイン中',
    'auth.account.purchases': '購入した記事',
    'auth.account.nopurchases': 'まだ購入した記事はありません。',
    'auth.logout': 'ログアウト',
    'auth.verify.ok': 'ログインしました。',
    'auth.verify.fail': 'リンクが無効か期限切れです。もう一度お試しください。',
    'auth.error': '送信に失敗しました。時間をおいて再度お試しください。',

    'contact.name': 'お名前 / 屋号',
    'contact.email': '連絡先メール（任意）',
    'contact.discord': 'Discord ユーザー名（任意）',
    'contact.message': 'ご相談内容',
    'contact.send': '送信する',
    'contact.sending': '送信中…',
    'contact.ok': '送信しました。Discord でご連絡します。',
    'contact.error': '送信に失敗しました。Discord から直接ご連絡ください。',
    'contact.required': '必須項目を入力してください。',

    'footer.sections': 'セクション',
    'footer.about': 'tsunagi について',
    'footer.rights': 'All rights reserved.',
    'footer.rss': 'RSS',

    '404.title': 'ページが見つかりません',
    '404.desc': 'お探しのページは移動または削除された可能性があります。',
    '404.home': 'トップに戻る',
  },

  en: {
    'site.name': 'tsunagi',
    'site.tagline': 'Build. Share. Connect.',

    'nav.catalog': 'Catalog',
    'nav.content': 'Content',
    'nav.consulting': 'Consulting',
    'nav.account': 'Account',
    'nav.menu': 'Menu',
    'nav.skip': 'Skip to content',

    'home.hero.kicker': 'The tsunagi.app project',
    'home.hero.title': 'Build apps, share what we learn, connect with people.',
    'home.hero.lead':
      'tsunagi brings together a family of indie apps and the know-how behind designing, building, and running them — a product catalog, free and paid content, and development consulting, all in one place.',
    'home.hero.cta.catalog': 'Browse the catalog',
    'home.hero.cta.consulting': 'Discuss a project',

    'home.section.catalog.title': 'Catalog — Products',
    'home.section.catalog.desc':
      'Apps published on the tsunagi.app domain, plus projects still in development.',
    'home.section.content.title': 'Content — Articles & know-how',
    'home.section.content.desc':
      'Approaches to building, running, and consulting on apps. Some articles are paid.',
    'home.section.consulting.title': 'Consulting — Development services',
    'home.section.consulting.desc':
      'We take on app design, development, and operations. Inquiries are handled via Discord.',
    'home.section.more': 'Learn more',

    'catalog.title': 'Catalog',
    'catalog.lead': 'tsunagi products and projects in development.',
    'catalog.filter.all': 'All',
    'catalog.empty': 'No matching products.',
    'catalog.visit': 'Open app',
    'catalog.repo': 'Repository',
    'catalog.back': 'Back to Catalog',

    'content.title': 'Content',
    'content.lead': 'Approaches to app development, operations, and consulting.',
    'content.empty': 'No articles yet.',
    'content.readmore': 'Read more',
    'content.back': 'Back to Content',
    'content.published': 'Published',
    'content.updated': 'Updated',
    'content.related': 'Related articles',
    'content.toc': 'Contents',

    'consulting.title': 'Consulting',
    'consulting.lead':
      'We bring the know-how from building tsunagi products to your app design, development, and operations.',
    'consulting.contact.title': 'Talk to us on Discord',
    'consulting.contact.desc':
      'Inquiries are handled via Discord. Join the server to talk directly, or send a message with the form below.',
    'consulting.contact.join': 'Join the Discord server',

    'access.free': 'Free',
    'access.paid': 'Paid',
    'paywall.title': 'The rest of this article is paid',
    'paywall.desc': 'Purchase once and read the full article anytime, on any device.',
    'paywall.price': 'Price',
    'paywall.buy': 'Buy to read',
    'paywall.owned': 'Purchased — showing the full article',
    'paywall.login.note': 'Sign in to purchase and read.',
    'paywall.login.cta': 'Sign in / Sign up',

    'auth.title': 'Sign in / Sign up',
    'auth.lead':
      'Enter your email and we will send you a sign-in link. No password required.',
    'auth.email': 'Email address',
    'auth.send': 'Send sign-in link',
    'auth.sent.title': 'Check your inbox',
    'auth.sent.desc': 'Open the link in the email to finish signing in.',
    'auth.account.title': 'Account',
    'auth.account.email': 'Signed in as',
    'auth.account.purchases': 'Purchased articles',
    'auth.account.nopurchases': 'No purchased articles yet.',
    'auth.logout': 'Sign out',
    'auth.verify.ok': 'You are signed in.',
    'auth.verify.fail': 'The link is invalid or expired. Please try again.',
    'auth.error': 'Could not send the email. Please try again later.',

    'contact.name': 'Name / business',
    'contact.email': 'Contact email (optional)',
    'contact.discord': 'Discord username (optional)',
    'contact.message': 'How can we help?',
    'contact.send': 'Send',
    'contact.sending': 'Sending…',
    'contact.ok': 'Sent. We will reach out on Discord.',
    'contact.error': 'Could not send. Please contact us directly on Discord.',
    'contact.required': 'Please fill in the required fields.',

    'footer.sections': 'Sections',
    'footer.about': 'About tsunagi',
    'footer.rights': 'All rights reserved.',
    'footer.rss': 'RSS',

    '404.title': 'Page not found',
    '404.desc': 'The page may have moved or been removed.',
    '404.home': 'Back to home',
  },
} as const;

export type UIKey = keyof (typeof ui)['ja'];

/** 指定ロケールの翻訳関数を返す。未定義キーは ja にフォールバック。 */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key] ?? ui[defaultLocale][key];
  };
}

/** URL のパスから現在のロケールを判定する。 */
export function getLocaleFromUrl(url: URL): Locale {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return seg === 'en' ? 'en' : 'ja';
}

/**
 * ロケールに応じたサイト内パスを返す。
 * ja はプレフィックスなし、en は /en/ を付与する。
 * 例: localizedPath('/catalog', 'en') => '/en/catalog'
 */
export function localizedPath(path: string, locale: Locale): string {
  const clean = '/' + path.replace(/^\/+/, '').replace(/\/+$/, '');
  const normalized = clean === '/' ? '' : clean;
  return locale === 'ja' ? normalized || '/' : `/en${normalized}` || '/en';
}

/** 現在のパスを、別ロケールの対応パスへ変換する（言語切替用）。 */
export function switchLocalePath(currentPath: string, to: Locale): string {
  const stripped = currentPath.replace(/^\/en(?=\/|$)/, '') || '/';
  return localizedPath(stripped, to);
}
