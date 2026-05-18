import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 日英併記のテキスト（短い項目はファイル内に両言語を持たせる）
const bilingual = z.object({ ja: z.string(), en: z.string() });

/**
 * Catalog: 1アプリ = 1 YAML ファイル（src/content/apps/<slug>.yaml）。
 * AIエージェントはこの1ファイルを追加・編集するだけでカタログに反映できる。
 */
const apps = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/apps' }),
  schema: z.object({
    name: bilingual,
    tagline: bilingual,
    description: bilingual,
    status: z.enum(['live', 'in-development', 'planned']),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    thumbnail: z.string().optional(),
    accent: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(100),
    launchedAt: z.coerce.date().optional(),
  }),
});

/**
 * Content: 記事（src/content/articles/<locale>/<slug>.mdx）。
 * locale はディレクトリ名（ja / en）から判定する。
 * access: 'paid' の場合は price（日本円）必須。summary は常時公開で SEO/AIO に使う。
 */
const articles = defineCollection({
  loader: glob({ pattern: '{ja,en}/**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      category: z.string().optional(),
      access: z.enum(['free', 'paid']).default('free'),
      price: z.number().int().positive().optional(),
      currency: z.string().default('jpy'),
      coverImage: z.string().optional(),
      translationKey: z.string().optional(),
      draft: z.boolean().default(false),
    })
    .refine((d) => d.access === 'free' || (d.price !== undefined && d.price > 0), {
      message: 'access が paid の記事には price（日本円）が必要です。',
      path: ['price'],
    }),
});

/**
 * Consulting: サービス紹介の各項目（src/content/consulting/<locale>/<slug>.mdx）。
 */
const consulting = defineCollection({
  loader: glob({ pattern: '{ja,en}/**/*.{md,mdx}', base: './src/content/consulting' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().default(100),
    icon: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { apps, articles, consulting };
