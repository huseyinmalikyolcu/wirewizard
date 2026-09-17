import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { digits } from '@/lib/format';
import { statusLabel } from '@/lib/status';
import StatusSelect from '@/components/admin/StatusSelect';
import DeleteQuote from '@/components/admin/DeleteQuote';
import QuoteManager from '@/components/admin/QuoteManager';
import Icon from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function QuoteDetail({ params }) {
  await requireAdmin();
  const id = Number(params.id);
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: true, logs: { orderBy: { createdAt: 'asc' } } },
  });
  if (!quote) notFound();

  // Açılınca "okundu" işaretle
  if (!quote.isRead) await prisma.quote.update({ where: { id }, data: { isRead: true } });

  // Kalemlerdeki ürünlerin görsel/slug bilgisini getir
  const prodIds = quote.items.map((i) => i.productId).filter(Boolean);
  const prods = prodIds.length ? await prisma.product.findMany({ where: { id: { in: prodIds } }, select: { id: true, slug: true, image: true } }) : [];
  const pmap = Object.fromEntries(prods.map((p) => [p.id, p]));

  const info = [
    ['Ad Soyad', quote.name], ['Firma', quote.company], ['E-posta', quote.email],
    ['Telefon', quote.phone], ['Vergi Dairesi', quote.taxOffice], ['Vergi No', quote.taxNo],
    ['Şehir', quote.city], ['Adres', quote.address],
  ];
  const wa = quote.phone ? `https://wa.me/${digits(quote.phone)}?text=${encodeURIComponent(`Merhaba, ${quote.name}. #${quote.id} numaralı teklif talebiniz hakkında bilgi vermek istiyoruz.`)}` : null;

  return (
    <div>
      <div className="adminHead">
        <div>
          <a href="/admin" className="link">← Teklifler</a>
          <h1 style={{ marginTop: 6 }}>Teklif #{quote.id}</h1>
          <div className="small">{new Date(quote.createdAt).toLocaleString('tr-TR')}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusSelect id={quote.id} current={quote.status} />
          <a className="btn ghost" href={`/admin/teklif/${quote.id}/yazdir`} target="_blank"><Icon name="download" size={16} /> Yazdır / PDF</a>
          <DeleteQuote id={quote.id} />
        </div>
      </div>

      <div className="detailGrid">
        <section className="panel">
          <h3>Müşteri Bilgileri</h3>
          <table className="kv"><tbody>
            {info.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v || '—'}</td></tr>)}
          </tbody></table>
          {quote.notes && (<><h3 style={{ marginTop: 16 }}>Müşteri Notu</h3><p className="notes">{quote.notes}</p></>)}
          <div className={'kvkkOk' + (quote.kvkk ? '' : ' warn')}>
            <Icon name={quote.kvkk ? 'check' : 'alert'} size={15} /> {quote.kvkk ? 'KVKK onayı verildi' : 'KVKK onayı yok'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <a className="btn ghost" href={`mailto:${quote.email}?subject=${encodeURIComponent('Teklif #' + quote.id)}`}><Icon name="mail" size={16} /> E-posta</a>
            {wa && <a className="btn ghost" href={wa} target="_blank"><Icon name="phone" size={16} /> WhatsApp</a>}
          </div>

          <h3 style={{ marginTop: 20 }}>Durum Geçmişi</h3>
          <ul className="timeline">
            <li><span className="dot" /><div><b>Oluşturuldu</b><div className="small">{new Date(quote.createdAt).toLocaleString('tr-TR')}</div></div></li>
            {quote.logs.map((l) => (
              <li key={l.id}><span className="dot" /><div><b>{statusLabel(l.status)}</b><div className="small">{new Date(l.createdAt).toLocaleString('tr-TR')}</div></div></li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Ürünler &amp; Fiyatlandırma ({quote.items.length})</h3>
          <QuoteManager quote={{
            id: quote.id, status: quote.status, email: quote.email, phone: quote.phone,
            notes: quote.notes, vatRate: quote.vatRate, adminNote: quote.adminNote,
            items: quote.items.map((i) => {
              const p = i.productId ? pmap[i.productId] : null;
              return { id: i.id, productId: i.productId, productName: i.productName, sku: i.sku, options: i.options, qty: i.qty, unitPrice: i.unitPrice, image: p?.image || '', slug: p?.slug || '' };
            }),
          }} />
        </section>
      </div>
    </div>
  );
}
