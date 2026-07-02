#!/usr/bin/env node
// 種(seed)コンテンツ → 各SNSの投稿ドラフトを生成し automation/queue/ に書き出す。
//
// 使い方:
//   node automation/generate-social-drafts.mjs                 # seeds/ の最新1件を生成
//   node automation/generate-social-drafts.mjs <seed.md>       # 指定した種を生成
//   NO_LLM=1 node automation/generate-social-drafts.mjs        # LLMを使わずテンプレのみ
//
// ANTHROPIC_API_KEY があれば Claude で生成、無ければ決定的テンプレートにフォールバック。

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { generateForSeed, newestSeed } from './lib/core.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
config.__root = root;

const arg = process.argv[2];
const seedsDir = join(__dirname, 'seeds');
const seedPath = arg ? resolve(arg) : newestSeed(seedsDir);

if (!seedPath || !existsSync(seedPath)) {
  console.error('種ファイルが見つかりません。automation/seeds/ に .md を置くか、パスを引数で渡してください。');
  process.exit(1);
}

const useLLM = !process.env.NO_LLM;
console.log(`種: ${seedPath}`);
console.log(`生成モード: ${useLLM && process.env.ANTHROPIC_API_KEY ? 'Anthropic' : 'テンプレート'}`);

const written = await generateForSeed(seedPath, config, { useLLM });
console.log(`\n${written.length} 件のドラフトを生成しました。`);
console.log('承認するには各ファイルの front matter を status: pending → approved に変更してください。');
