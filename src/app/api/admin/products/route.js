import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { cleanHtml } from '@/lib/sanitize';

function slugify(s) {
  return String(s).toLowerCase()
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'urun';
}

export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const d = await req.json().catch(() => ({}));
  if (!d.name?.trim()) return NextResponse.json({ error: 'Ürün adı gerekli' }, { status: 400 });

  let slug = slugify(d.slug || d.name);
  if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  // yeni id: mevcut en büyük + 1 (kaynak id'leriyle çakışmaması için yüksek aralık)
  const max = await prisma.product.aggregate({ _max: { id: true } });
  const id = Math.max(900000, (max._max.id || 0) + 1);

  const p = await prisma.product.create({
    data: {
      id, slug, name: d.name.trim(), sku: d.sku || '', type: 'simple',
      shortDesc: d.shortDesc || '', descHtml: cleanHtml(d.descHtml || ''), image: d.image || '',
      categoryId: d.categoryId ? Number(d.categoryId) : null,
      isVisible: d.isVisible !== false, sortOrder: Number(d.sortOrder) || 0,
    },
  });
  return NextResponse.json({ ok: true, id: p.id });
}
