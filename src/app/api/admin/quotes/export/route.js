import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { statusLabel } from '@/lib/status';

function cell(v) {
  const s = String(v ?? '').replace(/"/g, '""');
  return `"${s}"`;
}
function parseOpts(s) { try { return JSON.parse(s || '[]'); } catch { return []; } }

export async function GET(req) {
  if (!(await getSession())) return new Response('Yetkisiz', { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim();

  const where = {};
  if (status) where.status = status;
  if (q) where.OR = [
    { name: { contains: q } }, { company: { contains: q } },
    { email: { contains: q } }, { phone: { contains: q } },
  ];

  const quotes = await prisma.quote.findMany({ where, orderBy: { createdAt: 'desc' }, include: { items: true } });

  const headers = ['No', 'Tarih', 'Durum', 'Ad Soyad', 'Firma', 'E-posta', 'Telefon', 'Vergi Dairesi', 'Vergi No', 'Şehir', 'Adres', 'Ürünler', 'Notlar'];
  const lines = [headers.map(cell).join(';')];
  for (const t of quotes) {
    const items = t.items.map((it) => {
      const opts = parseOpts(it.options).map((o) => o.value).join('/');
      return `${it.productName}${opts ? ' [' + opts + ']' : ''}${it.sku ? ' (' + it.sku + ')' : ''} x${it.qty}`;
    }).join(' | ');
    lines.push([
      t.id, new Date(t.createdAt).toLocaleString('tr-TR'), statusLabel(t.status),
      t.name, t.company, t.email, t.phone, t.taxOffice, t.taxNo, t.city, t.address, items, t.notes,
    ].map(cell).join(';'));
  }

  const csv = '﻿' + lines.join('\r\n'); // BOM → Excel'de Türkçe karakter düzgün
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="teklifler-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
