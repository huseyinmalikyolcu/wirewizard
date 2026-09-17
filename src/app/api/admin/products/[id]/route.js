import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { cleanHtml } from '@/lib/sanitize';

export async function PATCH(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const id = Number(params.id);
  const d = await req.json().catch(() => ({}));
  const data = {};
  if (d.name !== undefined) data.name = String(d.name).trim();
  if (d.sku !== undefined) data.sku = String(d.sku);
  if (d.shortDesc !== undefined) data.shortDesc = String(d.shortDesc);
  if (d.descHtml !== undefined) data.descHtml = cleanHtml(d.descHtml);
  if (d.image !== undefined) data.image = String(d.image);
  if (d.sortOrder !== undefined) data.sortOrder = Number(d.sortOrder) || 0;
  if (d.isVisible !== undefined) data.isVisible = !!d.isVisible;
  if (d.categoryId !== undefined) data.categoryId = d.categoryId ? Number(d.categoryId) : null;

  await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  await prisma.product.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
