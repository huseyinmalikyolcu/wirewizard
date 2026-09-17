import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { tl } from '@/lib/format';
import { SITE } from '@/lib/config';
import PrintButton from '@/components/admin/PrintButton';

export const dynamic = 'force-dynamic';

function parseOpts(s) { try { return JSON.parse(s || '[]'); } catch { return []; } }

export default async function PrintQuote({ params }) {
  await requireAdmin();
  const quote = await prisma.quote.findUnique({ where: { id: Number(params.id) }, include: { items: true } });
  if (!quote) notFound();

  const subtotal = quote.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const vat = subtotal * (quote.vatRate || 0) / 100;
  const total = subtotal + vat;
  const td = { padding: '8px 10px', borderBottom: '1px solid #e6e8eb' };

  return (
    <div className="printDoc">
      <div className="noprint" style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <a className="btn ghost" href={`/admin/teklif/${quote.id}`}>← Geri</a>
        <PrintButton />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', padding: 30, color: '#16181c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #e30613', paddingBottom: 16, marginBottom: 20 }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/agen-logo.png" alt={SITE.brand} style={{ height: 42 }} />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{SITE.email} · {SITE.phone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>FİYAT TEKLİFİ</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Teklif No: #{quote.id}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{new Date(quote.createdAt).toLocaleDateString('tr-TR')}</div>
          </div>
        </div>

        <div style={{ marginBottom: 18, fontSize: 14, lineHeight: 1.7 }}>
          <b>Müşteri</b><br />
          {quote.company && <>{quote.company}<br /></>}
          {quote.name}<br />
          {quote.taxOffice && <>Vergi D.: {quote.taxOffice} · Vergi No: {quote.taxNo}<br /></>}
          {(quote.city || quote.address) && <>{quote.address} {quote.city}<br /></>}
          {quote.email} · {quote.phone}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#15171a', color: '#fff' }}>
            <th style={{ ...td, textAlign: 'left' }}>#</th>
            <th style={{ ...td, textAlign: 'left' }}>Ürün</th>
            <th style={{ ...td, textAlign: 'center' }}>Adet</th>
            <th style={{ ...td, textAlign: 'right' }}>Birim</th>
            <th style={{ ...td, textAlign: 'right' }}>Tutar</th>
          </tr></thead>
          <tbody>
            {quote.items.map((i, n) => {
              const opts = parseOpts(i.options);
              return (
                <tr key={i.id}>
                  <td style={td}>{n + 1}</td>
                  <td style={td}>{i.productName}
                    {opts.length > 0 && <div style={{ color: '#888', fontSize: 11 }}>{opts.map((o) => `${o.name}: ${o.value}`).join(', ')}</div>}
                    {i.sku && <div style={{ color: '#aaa', fontSize: 11 }}>{i.sku}</div>}
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>{i.qty}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{tl(i.unitPrice)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{tl(i.unitPrice * i.qty)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <table style={{ width: '100%', marginTop: 14, fontSize: 14 }}><tbody>
          <tr><td style={{ textAlign: 'right', padding: '3px 10px', color: '#666' }}>Ara Toplam</td><td style={{ textAlign: 'right', width: 150, padding: '3px 0' }}>{tl(subtotal)}</td></tr>
          <tr><td style={{ textAlign: 'right', padding: '3px 10px', color: '#666' }}>KDV (%{quote.vatRate || 0})</td><td style={{ textAlign: 'right', padding: '3px 0' }}>{tl(vat)}</td></tr>
          <tr><td style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 800, fontSize: 16 }}>Genel Toplam</td><td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 800, fontSize: 16, color: '#e30613' }}>{tl(total)}</td></tr>
        </tbody></table>

        {quote.notes && <p style={{ fontSize: 12, color: '#666', marginTop: 16 }}><b>Not:</b> {quote.notes}</p>}
        <p style={{ fontSize: 11, color: '#aaa', marginTop: 22, borderTop: '1px solid #e6e8eb', paddingTop: 12 }}>
          {SITE.brand} {SITE.tagline} · Wire Wizard® Yetkili Distribütörü · Bu teklif bilgilendirme amaçlıdır; fiyatlar ve stok durumu değişiklik gösterebilir.
        </p>
      </div>
    </div>
  );
}
