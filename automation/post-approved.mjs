#!/usr/bin/env node
// automation/queue/ の status: approved なドラフトを各SNSへ投稿する。
// 投稿に成功したら status: posted に更新。シークレットが無いチャネルはスキップ。
//
// 使い方:
//   node automation/post-approved.mjs            # 承認済みを投稿
//   DRY_RUN=1 node automation/post-approved.mjs  # 投稿せず対象だけ表示

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { loadQueueItem } from './lib/core.mjs';
import { postToChannel } from './lib/post.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const queueDir = join(__dirname, 'queue');

if (!existsSync(queueDir)) {
  console.log('queue/ がありません。生成を先に実行してください。');
  process.exit(0);
}

const files = readdirSync(queueDir).filter((f) => f.endsWith('.md'));
let posted = 0;
let skipped = 0;

for (const f of files) {
  const path = join(queueDir, f);
  const item = loadQueueItem(path);
  if (item.data.status !== 'approved') continue;

  if (process.env.DRY_RUN) {
    console.log(`[dry-run] ${item.data.channel} ← ${f}`);
    continue;
  }

  try {
    const result = await postToChannel(item.data.channel, item.text);
    if (result.skipped) {
      console.log(`- スキップ ${item.data.channel} (${f}): ${result.reason}`);
      skipped++;
      continue;
    }
    // status を posted に更新
    const raw = readFileSync(path, 'utf8').replace(/^status:\s*approved/m, 'status: posted');
    writeFileSync(path, raw, 'utf8');
    console.log(`✓ 投稿 ${item.data.channel} (${f}) id=${result.id}`);
    posted++;
  } catch (e) {
    console.error(`✗ 失敗 ${item.data.channel} (${f}): ${e.message}`);
  }
}

console.log(`\n投稿 ${posted} 件 / スキップ ${skipped} 件`);
