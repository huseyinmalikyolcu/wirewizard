import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyPassword, hashPassword } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const rl = rateLimit('pwd:' + session.id, { max: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) return NextResponse.json({ error: 'Çok fazla deneme, sonra tekrar deneyin.' }, { status: 429 });

  const { current, next } = await req.json().catch(() => ({}));
  if (!next || String(next).length < 8) {
    return NextResponse.json({ error: 'Yeni şifre en az 8 karakter olmalı.' }, { status: 400 });
  }
  const admin = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!admin || !verifyPassword(current, admin.passwordHash)) {
    return NextResponse.json({ error: 'Mevcut şifre hatalı.' }, { status: 400 });
  }
  await prisma.adminUser.update({ where: { id: session.id }, data: { passwordHash: hashPassword(next) } });
  return NextResponse.json({ ok: true });
}
