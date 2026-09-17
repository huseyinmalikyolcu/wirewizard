import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

const COOKIE = 'wl_admin';
const MAX_AGE = 60 * 60 * 8; // 8 saat

function secret() {
  return process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';
}

export function hashPassword(pw) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(pw, stored) {
  try {
    const [salt, hash] = String(stored).split(':');
    const a = Buffer.from(hash, 'hex');
    const b = scryptSync(pw, salt, 64);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const unb64 = (s) => Buffer.from(s, 'base64url').toString();

export function signToken(payload) {
  const body = b64(JSON.stringify(payload));
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(unb64(body));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Route handler içinde çerez ayarlamak için kullanılır
export function sessionCookie(adminId) {
  const token = signToken({ id: adminId, exp: Date.now() + MAX_AGE * 1000 });
  return {
    name: COOKIE, value: token, httpOnly: true, sameSite: 'lax', path: '/', maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === 'production', // üretimde yalnızca HTTPS üzerinden
  };
}
export const clearCookie = () => ({ name: COOKIE, value: '', httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0, secure: process.env.NODE_ENV === 'production' });

// Server component / route handler içinde oturumu okur
export async function getSession() {
  const token = cookies().get(COOKIE)?.value;
  const payload = verifyToken(token);
  if (!payload) return null;
  const admin = await prisma.adminUser.findUnique({ where: { id: payload.id } });
  return admin ? { id: admin.id, email: admin.email, name: admin.name } : null;
}

// Korumalı sayfaların başında çağrılır: oturum yoksa giriş sayfasına yönlendirir
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  return s;
}
