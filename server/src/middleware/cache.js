const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 }); // entries live 60s

// Cache GET responses per user. Add ?nocache=true to bypass (used for benchmarking).
function cacheGet(req, res, next) {
  if (req.query.nocache === 'true') { res.set('X-Cache', 'BYPASS'); return next(); }
  const key = `tasks:${req.user.id}:${req.originalUrl}`;
  const hit = cache.get(key);
  if (hit) { res.set('X-Cache', 'HIT'); return res.json(hit); }
  res.set('X-Cache', 'MISS');
  const original = res.json.bind(res);
  res.json = (body) => { cache.set(key, body); return original(body); };
  next();
}

// Any write must invalidate that user's cached lists
function invalidate(userId) {
  cache.keys().filter((k) => k.startsWith(`tasks:${userId}:`)).forEach((k) => cache.del(k));
}
module.exports = { cacheGet, invalidate, cache };
