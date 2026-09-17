import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { statusMap } from '@/lib/status';

export async function PATCH(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  // Durum değişikliği (+ geçmiş kaydı)
  if (body.status) {
    if (!statusMap[body.status]) return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    const cur = await prisma.quote.findUnique({ where: { id }, select: { status: true } });
    await prisma.quote.update({ where: { id }, data: { status: body.status } });
    if (cur && cur.status !== body.status) {
      await prisma.quoteStatusLog.create({ data: { quoteId: id, status: body.status } });
    }
  }

  // İç not / KDV
  const data = {};
  if (body.adminNote !== undefined) data.adminNote = String(body.adminNote);
  if (body.vatRate !== undefined) data.vatRate = Math.max(0, Number(body.vatRate) || 0);
  if (body.isRead !== undefined) data.isRead = !!body.isRead;
  if (Object.keys(data).length) await prisma.quote.update({ where: { id }, data });

  // Kalem fiyat/adet güncelleme
  if (Array.isArray(body.items)) {
    for (const it of body.items) {
      await prisma.quoteItem.update({
        where: { id: Number(it.id) },
        data: { unitPrice: Math.max(0, Number(it.unitPrice) || 0), qty: Math.max(1, Number(it.qty) || 1) },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  await prisma.quote.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
