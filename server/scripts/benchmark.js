// Usage: (server running)  npm run benchmark
const BASE = process.env.API_URL || 'http://localhost:5000/api';
const N = 30;

async function call(path, opts = {}, token) {
  const res = await fetch(BASE + path, { ...opts, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) } });
  return { res, data: await res.json() };
}
async function time(path, token) {
  const t0 = performance.now();
  const { res } = await call(path, {}, token);
  return { ms: performance.now() - t0, cache: res.headers.get('x-cache') };
}
const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2);

(async () => {
  const email = `bench${Date.now()}@test.com`;
  const { data } = await call('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Bench', email, password: 'secret123' }) });
  const token = data.token;
  for (let i = 0; i < 200; i++) await call('/tasks', { method: 'POST', body: JSON.stringify({ title: `Task ${i}`, description: 'benchmark data' }) }, token);

  const uncached = [];
  for (let i = 0; i < N; i++) uncached.push((await time('/tasks?nocache=true', token)).ms);
  await time('/tasks', token); // warm cache (MISS)
  const cached = [];
  for (let i = 0; i < N; i++) cached.push((await time('/tasks', token)).ms);

  console.log(`\nGET /api/tasks with 200 tasks, ${N} requests each`);
  console.log(`Without cache (MongoDB every time): ${avg(uncached)} ms avg`);
  console.log(`With node-cache (HIT):              ${avg(cached)} ms avg`);
  console.log(`Speed-up: ${(avg(uncached) / avg(cached)).toFixed(1)}x\n`);
})();
