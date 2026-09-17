// Basit bellek-içi rate limit (tek sunucu için). Üretimde çok örnekli ortamda
// Redis tabanlı bir çözüme geçilmesi önerilir.
const hits = new Map();

export function rateLimit(key, { max = 10, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now > rec.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  rec.count += 1;
  if (rec.count > max) return { ok: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  return { ok: true };
}

export function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

// Ara sıra eski kayıtları temizle
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
}, 10 * 60 * 1000).unref?.();
