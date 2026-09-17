import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, sessionCookie } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/ratelimit';

export async function POST(req) {
  // Brute-force koruması: IP başına 10 deneme / 10 dakika
  const rl = rateLimit('login:' + clientIp(req), { max: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: `Çok fazla deneme. ${rl.retryAfter} sn sonra tekrar deneyin.` }, { status: 429 });
  }

  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 });
  }
  const admin = await prisma.adminUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(admin.id));
  return res;
}
