import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
  if (!EXT[file.type]) return NextResponse.json({ error: 'Geçersiz dosya türü (JPG, PNG, WEBP, GIF)' }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 5 * 1024 * 1024) return NextResponse.json({ error: 'Dosya çok büyük (en fazla 5 MB)' }, { status: 400 });

  const name = `urun-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${EXT[file.type]}`;
  const dir = path.join(process.cwd(), 'public', 'urunler');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ ok: true, path: `/urunler/${name}` });
}
