import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendQuoteEmails } from '@/lib/mail';

export async function POST(req) {
  try {
    const body = await req.json();
    const c = body.customer || {};
    const items = Array.isArray(body.items) ? body.items : [];

    // Sunucu tarafı doğrulama
    if (!c.name?.trim() || !/^\S+@\S+\.\S+$/.test(c.email || '') || !c.phone?.trim() || !c.kvkk) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
    }

    const quote = await prisma.quote.create({
      data: {
        name: c.name.trim(),
        company: c.company || '',
        taxOffice: c.taxOffice || '',
        taxNo: c.taxNo || '',
        email: c.email.trim(),
        phone: c.phone.trim(),
        city: c.city || '',
        address: c.address || '',
        notes: c.notes || '',
        kvkk: !!c.kvkk,
        items: {
          create: items.map((i) => ({
            productId: i.productId || null,
            productName: i.productName || '',
            sku: i.sku || '',
            options: JSON.stringify(i.options || []),
            qty: Math.max(1, parseInt(i.qty, 10) || 1),
          })),
        },
      },
    });

    // Bildirim e-postaları (hata olsa bile teklif kaydı geçerli kalır)
    try {
      await sendQuoteEmails({ id: quote.id, customer: c, items });
    } catch (mailErr) {
      console.error('Teklif e-postası gönderilemedi (kayıt başarılı):', mailErr);
    }

    return NextResponse.json({ ok: true, id: quote.id });
  } catch (err) {
    console.error('Teklif kaydı hatası:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
