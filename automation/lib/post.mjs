// 承認済みドラフトを各SNSへ投稿するアダプタ群。
// すべて「必要なシークレットが環境変数に無ければスキップ」する安全設計。
// トークンは絶対にコミットしない（GitHub Actions の Secrets から注入）。

async function postX(text) {
  const token = process.env.X_ACCESS_TOKEN; // OAuth2 user token (tweet.write)
  if (!token) return { skipped: true, reason: 'X_ACCESS_TOKEN 未設定' };
  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`X API ${res.status}: ${body}`);
  return { ok: true, id: safeId(body) };
}

async function postThreads(text) {
  const token = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;
  if (!token || !userId) return { skipped: true, reason: 'THREADS_ACCESS_TOKEN/THREADS_USER_ID 未設定' };
  const base = 'https://graph.threads.net/v1.0';
  // 1) コンテナ作成
  const createUrl = `${base}/${userId}/threads?media_type=TEXT&text=${encodeURIComponent(text)}&access_token=${token}`;
  const c = await fetch(createUrl, { method: 'POST' });
  const cbody = await c.text();
  if (!c.ok) throw new Error(`Threads create ${c.status}: ${cbody}`);
  const creationId = safeId(cbody);
  // 2) 公開
  const pubUrl = `${base}/${userId}/threads_publish?creation_id=${creationId}&access_token=${token}`;
  const p = await fetch(pubUrl, { method: 'POST' });
  const pbody = await p.text();
  if (!p.ok) throw new Error(`Threads publish ${p.status}: ${pbody}`);
  return { ok: true, id: safeId(pbody) };
}

async function postLinkedIn(text) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN; // 例: urn:li:organization:123 または urn:li:person:abc
  if (!token || !authorUrn) return { skipped: true, reason: 'LINKEDIN_ACCESS_TOKEN/LINKEDIN_AUTHOR_URN 未設定' };
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-restli-protocol-version': '2.0.0',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`LinkedIn API ${res.status}: ${body}`);
  return { ok: true, id: safeId(body) };
}

function safeId(body) {
  try {
    const j = JSON.parse(body);
    return j.id || (j.data && j.data.id) || 'unknown';
  } catch {
    return 'unknown';
  }
}

const ADAPTERS = { x: postX, threads: postThreads, linkedin: postLinkedIn };

export async function postToChannel(channelId, text) {
  const fn = ADAPTERS[channelId];
  if (!fn) return { skipped: true, reason: `未対応チャネル: ${channelId}` };
  return fn(text);
}
