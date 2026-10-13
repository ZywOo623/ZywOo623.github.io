import { mkdir, readFile, writeFile } from 'node:fs/promises';

const handle = 'ZywOo623';
const output = new URL('../src/data/codeforces.json', import.meta.url);
const endpoint = 'https://codeforces.com/api/';

async function request(method, params) {
  const url = new URL(method, endpoint);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Codeforces HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.status !== 'OK') throw new Error('Codeforces API returned an error');
  return payload.result;
}

try {
  const [users, submissions, history] = await Promise.all([
    request('user.info', { handles: handle }),
    request('user.status', { handle, from: 1, count: 10000 }),
    request('user.rating', { handle })
  ]);
  const user = users[0];
  const accepted = new Set();
  const recentAccepted = [];
  for (const submission of submissions) {
    if (submission.verdict !== 'OK' || !submission.problem) continue;
    const problem = submission.problem;
    const key = `${problem.contestId ?? 'unknown'}-${problem.index ?? problem.name}`;
    if (accepted.has(key)) continue;
    accepted.add(key);
    if (recentAccepted.length < 4 && problem.contestId && problem.index) {
      recentAccepted.push({
        name: problem.name,
        index: problem.index,
        contestId: problem.contestId,
        rating: problem.rating ?? null,
        date: new Date(submission.creationTimeSeconds * 1000).toISOString().slice(0, 10)
      });
    }
  }

  const snapshot = {
    status: 'ok',
    handle,
    fetchedAt: new Date().toISOString(),
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? null,
    solved: accepted.size,
    submissions: submissions.length,
    submissionsTruncated: submissions.length === 10000,
    contests: history.length,
    recentAccepted
  };
  await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
  await writeFile(output, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`Updated Codeforces snapshot for ${handle}`);
} catch (error) {
  try {
    const previous = JSON.parse(await readFile(output, 'utf8'));
    if (previous.status === 'ok') {
      console.warn('Codeforces API unavailable; retaining the last dated snapshot.');
      process.exit(0);
    }
  } catch {}
  await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
  await writeFile(output, JSON.stringify({ status: 'unavailable', handle }, null, 2) + '\n');
  console.warn('Codeforces API unavailable; the site will show a link to the profile.');
}
