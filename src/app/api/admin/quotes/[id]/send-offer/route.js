import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendOfferEmail } from '@/lib/mail';

export async function POST(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const id = Number(params.id);

  const quote = await prisma.quote.findUnique({ where: { id }, include: { items: true } });
  if (!quote) return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 });

  let result;
  try {
    result = await sendOfferEmail(quote);
  } catch (e) {
    console.error('Fiyatlı teklif e-postası hatası:', e);
    return NextResponse.json({ error: 'E-posta gönderilemedi (SMTP ayarlarını kontrol edin)' }, { status: 500 });
  }

  // Durumu "Teklif Verildi" yap + geçmişe ekle
  if (quote.status !== 'quoted') {
    await prisma.quote.update({ where: { id }, data: { status: 'quoted' } });
    await prisma.quoteStatusLog.create({ data: { quoteId: id, status: 'quoted' } });
  }

  return NextResponse.json({ ok: true, sent: result.sent, total: result.total });
}
