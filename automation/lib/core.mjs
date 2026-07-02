// 依存ゼロの共通ロジック（Node 22+ / ESM）。
// 種(seed)コンテンツ → 各SNS向け投稿ドラフトを生成し、承認キューに書き出す。
// LLM(Anthropic)キーがあれば高品質生成、無ければ決定的テンプレートにフォールバック。

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

// ---- 極小フロントマターパーサ（key: value と [a, b] 配列のみ対応） ----
export function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: md.trim() };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      data[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body: m[2].trim() };
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'seed';
}

// ---- チャネル別の決定的テンプレート（LLM無しでも動く安全な下書き） ----
function templatePost(channel, seed) {
  const { title, url } = seed.meta;
  const summary = firstSentences(seed.body, channel.id === 'x' ? 1 : 2);
  const tags = (channel.hashtags || []).join(' ');
  let text;
  if (channel.id === 'x') {
    text = `${title}\n\n${summary}\n\n${url}\n${tags}`;
  } else if (channel.id === 'threads') {
    text = `${title}\n\n${summary}\n\n詳しくはこちら → ${url}\n\n${tags}`;
  } else if (channel.id === 'linkedin') {
    text = `【${title}】\n\n${summary}\n\n▼詳細\n${url}\n\n${tags}`;
  } else {
    text = `${title}\n\n${summary}\n\n${url}\n${tags}`;
  }
  return clamp(text, channel.maxChars);
}

function firstSentences(body, n) {
  const clean = body.replace(/\s+/g, ' ').trim();
  const parts = clean.split(/(?<=[。！？.!?])\s*/).filter(Boolean);
  return parts.slice(0, n).join('');
}

function clamp(text, max) {
  if (!max || text.length <= max) return text;
  // リンク行を保ちつつ本文を切り詰める（雑だが安全側）。
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

// ---- Anthropic 生成（任意）。ANTHROPIC_API_KEY があれば使う ----
export async function llmPost(channel, seed, { model }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const prompt = [
    `あなたはブランド「${seed.config.brand}」のSNS運用担当です。`,
    `次の「種」コンテンツ（人間が書いた核となる洞察）を、${channel.label} 用の投稿文に"増幅"してください。`,
    ``,
    `# 制約`,
    `- 言語: ${seed.meta.lang || seed.config.defaultLang}`,
    `- 最大 ${channel.maxChars} 文字（ハッシュタグ・URL込み）。超えない。`,
    `- トーン: ${channel.voice}`,
    `- 末尾にURL(${seed.meta.url})を1つ入れる。`,
    `- ハッシュタグ候補: ${(channel.hashtags || []).join(' ')}（適切なものだけ使う）。`,
    `- 誇張・絵文字の多用・煽りは避ける。事実と洞察で語る。`,
    `- 出力は投稿本文のみ。前置きや説明は書かない。`,
    ``,
    `# 種コンテンツ`,
    `タイトル: ${seed.meta.title}`,
    ``,
    seed.body,
  ].join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    console.warn(`  [llm] ${channel.id}: API ${res.status} — テンプレートにフォールバック`);
    return null;
  }
  const json = await res.json();
  const text = (json.content || []).map((c) => c.text || '').join('').trim();
  return text ? clamp(text, channel.maxChars) : null;
}

// ---- キュー項目の直列化 ----
function serialize(item) {
  const fm = [
    '---',
    `seed: ${item.seed}`,
    `channel: ${item.channel}`,
    `account: ${item.account}`,
    `status: ${item.status}`,
    `lang: ${item.lang}`,
    `url: ${item.url}`,
    `generated_by: ${item.generated_by}`,
    '---',
    '',
    item.text,
    '',
  ].join('\n');
  return fm;
}

// ---- メイン: 1つの種から全チャネルのドラフトを生成 ----
export async function generateForSeed(seedPath, config, opts = {}) {
  const raw = readFileSync(seedPath, 'utf8');
  const { data: meta, body } = parseFrontmatter(raw);
  if (!meta.title || !meta.url) {
    throw new Error(`種ファイルに title と url が必要です: ${seedPath}`);
  }
  const seed = { meta, body, config };
  const dateStr = opts.date || new Date().toISOString().slice(0, 10);
  const slug = slugify(basename(seedPath).replace(/\.md$/, ''));

  const wanted = (meta.channels && meta.channels.length ? meta.channels : null);
  const channels = config.channels.filter(
    (c) => c.enabled && (!wanted || wanted.includes(c.id)),
  );

  const queueDir = join(config.__root, 'automation', 'queue');
  if (!existsSync(queueDir)) mkdirSync(queueDir, { recursive: true });

  const written = [];
  for (const channel of channels) {
    let text = opts.useLLM === false ? null : await llmPost(channel, seed, opts);
    let generated_by = 'anthropic';
    if (!text) {
      text = templatePost(channel, seed);
      generated_by = 'template';
    }
    const item = {
      seed: basename(seedPath),
      channel: channel.id,
      account: channel.account,
      status: 'pending',
      lang: meta.lang || config.defaultLang,
      url: meta.url,
      generated_by,
      text,
    };
    const outPath = join(queueDir, `${dateStr}__${slug}__${channel.id}.md`);
    writeFileSync(outPath, serialize(item), 'utf8');
    written.push(outPath);
    console.log(`  ✓ ${channel.id} (${generated_by}) → ${outPath}`);
  }
  return written;
}

export function newestSeed(seedsDir) {
  if (!existsSync(seedsDir)) return null;
  const files = readdirSync(seedsDir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  return files.length ? join(seedsDir, files[files.length - 1]) : null;
}

export function loadQueueItem(path) {
  const raw = readFileSync(path, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  return { data, text: body, path };
}
