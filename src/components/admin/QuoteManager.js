'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { tl } from '@/lib/format';
import ProductImage from '@/components/ProductImage';

function parseOpts(s) { try { return JSON.parse(s || '[]'); } catch { return []; } }

export default function QuoteManager({ quote }) {
  const router = useRouter();
  const [items, setItems] = useState(quote.items.map((i) => ({ ...i })));
  const [vatRate, setVatRate] = useState(quote.vatRate ?? 20);
  const [adminNote, setAdminNote] = useState(quote.adminNote || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const setItem = (id, k, v) => setItems((cur) => cur.map((i) => (i.id === id ? { ...i, [k]: v } : i)));

  const { subtotal, vat, total } = useMemo(() => {
    const sub = items.reduce((s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.qty) || 0), 0);
    const v = sub * (Number(vatRate) || 0) / 100;
    return { subtotal: sub, vat: v, total: sub + v };
  }, [items, vatRate]);

  const payload = () => ({
    adminNote, vatRate: Number(vatRate) || 0,
    items: items.map((i) => ({ id: i.id, unitPrice: Number(i.unitPrice) || 0, qty: Number(i.qty) || 1 })),
  });

  const save = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/admin/quotes/${quote.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()),
    });
    setBusy(false);
    setMsg(res.ok ? { ok: 1, t: 'Kaydedildi.' } : { t: 'Kaydedilemedi.' });
    if (res.ok) router.refresh();
  };

  const sendOffer = async () => {
    if (!confirm('Fiyatlı teklif müşteriye e-posta ile gönderilsin mi?')) return;
    setBusy(true); setMsg(null);
    await fetch(`/api/admin/quotes/${quote.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()),
    });
    const res = await fetch(`/api/admin/quotes/${quote.id}/send-offer`, { method: 'POST' });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ t: d.error || 'Gönderilemedi.' }); return; }
    setMsg({ ok: 1, t: d.sent ? 'Fiyatlı teklif müşteriye gönderildi.' : 'Kaydedildi (SMTP kapalı olduğu için e-posta gönderilmedi).' });
    router.refresh();
  };

  return (
    <div>
      <table className="adminTable compact priceTable">
        <thead><tr><th>Ürün</th><th>Adet</th><th>Birim Fiyat (TL)</th><th>Tutar</th></tr></thead>
        <tbody>
          {items.map((i) => {
            const opts = parseOpts(i.options);
            return (
              <tr key={i.id} className={i.productId ? 'rowlink' : ''}
                onClick={i.productId ? () => window.open(`/admin/urunler/${i.productId}`, '_blank') : undefined}>
                <td>
                  <div className="itemRow">
                    <div className="itemThumb">
                      <ProductImage local={i.slug ? `/urunler/${i.slug}.jpg` : ''} remote={i.image} alt="" />
                    </div>
                    <div>
                      <div className="itemName">{i.productName}</div>
                      {opts.length > 0 && <div className="small accent">{opts.map((o) => `${o.name}: ${o.value}`).join(' · ')}</div>}
                      {i.sku && <div className="small">Kod: {i.sku}</div>}
                      {i.productId && <a className="link" style={{ fontSize: 12 }} href={`/admin/urunler/${i.productId}`} target="_blank" onClick={(e) => e.stopPropagation()}>Ürünü gör →</a>}
                    </div>
                  </div>
                </td>
                <td style={{ width: 74 }} onClick={(e) => e.stopPropagation()}>
                  <input className="cellInput" type="number" min="1" value={i.qty}
                    onChange={(e) => setItem(i.id, 'qty', e.target.value)} />
                </td>
                <td style={{ width: 120 }} onClick={(e) => e.stopPropagation()}>
                  <input className="cellInput" type="number" min="0" step="0.01" value={i.unitPrice}
                    onChange={(e) => setItem(i.id, 'unitPrice', e.target.value)} />
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, width: 110 }}>{tl((Number(i.unitPrice) || 0) * (Number(i.qty) || 0))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="totals">
        <div><span>Ara Toplam</span><b>{tl(subtotal)}</b></div>
        <div>
          <span>KDV (%
            <input className="vatInput" type="number" min="0" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />)
          </span>
          <b>{tl(vat)}</b>
        </div>
        <div className="grand"><span>Genel Toplam</span><b>{tl(total)}</b></div>
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label>İç Not (yalnızca yöneticiler görür)</label>
        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Takip notları, hatırlatmalar..." />
      </div>

      {msg && <div className={'formMsg' + (msg.ok ? '' : ' err')} style={msg.ok ? { background: '#e6f7ec', color: '#1c8a4d' } : {}}>{msg.t}</div>}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
        <button className="btn" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor...' : 'Kaydet'}</button>
        <button className="btn" style={{ background: 'var(--accent)' }} disabled={busy} onClick={sendOffer}>Fiyatlı Teklifi Müşteriye Gönder</button>
      </div>
    </div>
  );
}
