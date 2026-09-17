'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';
import ProductImage from './ProductImage';
import Icon from './Icon';

export default function CartDrawer() {
  const { items, count, open, setOpen, setQty, remove } = useCart();
  const [quote, setQuote] = useState(false);
  if (!open && !quote) return null;

  return (
    <>
      {open && !quote && (
        <>
        <div className="overlay" onClick={() => setOpen(false)} />
        <div className="drawer">
          <div className="dhead"><h3>Teklif Sepeti</h3><button className="close" onClick={() => setOpen(false)}>×</button></div>
          <div className="ditems">
            {items.length === 0
              ? <div className="cartEmpty">Sepetiniz boş.<br />Ürünleri inceleyip teklif sepetine ekleyin.</div>
              : items.map((i) => (
                <div className="ditem" key={i.key}>
                  <ProductImage remote={i.image} alt="" />
                  <div className="di">
                    <h5>{i.name}</h5>
                    {i.options.map((o, x) => <div className="opt" key={x}>{o.name}: {o.value}</div>)}
                    {i.sku && <div className="sku">Kod: {i.sku}</div>}
                    <div className="ctl">
                      <div className="qty">
                        <button onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                        <span>{i.qty}</span>
                        <button onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                      </div>
                      <button className="rm" onClick={() => remove(i.key)}>Kaldır</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="dfoot">
            <div className="tot"><span>Toplam kalem</span><b>{items.length} çeşit / {count} adet</b></div>
            <button className="quoteBtn" disabled={items.length === 0} onClick={() => setQuote(true)}>Teklif Al →</button>
          </div>
        </div>
        </>
      )}
      {quote && <QuoteForm onClose={() => { setQuote(false); setOpen(false); }} onBack={() => setQuote(false)} />}
    </>
  );
}

const EMPTY = { name: '', company: '', taxOffice: '', taxNo: '', email: '', phone: '', city: '', address: '', notes: '', kvkk: false };

function QuoteForm({ onClose, onBack }) {
  const { items, clear } = useCart();
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 1;
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 1;
    if (!f.phone.trim()) e.phone = 1;
    if (!f.kvkk) e.kvkk = 1;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setMsg('');
    if (!validate()) { setMsg('Lütfen zorunlu (*) alanları ve KVKK onayını kontrol edin.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: f,
          items: items.map((i) => ({
            productId: i.id, productName: i.name, sku: i.sku,
            options: i.options, qty: i.qty,
          })),
        }),
      });
      if (!res.ok) throw new Error('Sunucu hatası');
      clear();
      setDone(true);
    } catch (err) {
      setMsg('Gönderim sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal">
        <div className="mhead"><button className="close" onClick={onClose}>×</button></div>
        {done ? (
          <div className="success">
            <div className="ic"><Icon name="check" size={32} stroke={2.5} /></div>
            <h2>Teklif talebiniz alındı</h2>
            <p>En kısa sürede satış ekibimiz sizinle iletişime geçecek.<br />İlginiz için teşekkür ederiz.</p>
            <button className="submitBtn" style={{ maxWidth: 240, margin: '20px auto 0' }} onClick={onClose}>Kapat</button>
          </div>
        ) : (
          <div className="qform">
            <h2>Teklif Talebi</h2>
            <div className="sub">Bilgilerinizi girin; sepetinizdeki ürünler için en kısa sürede fiyat teklifi iletelim.</div>
            <div className="qsum">
              {items.map((i) => (
                <div className="qi" key={i.key}>
                  <span>{i.name}{i.options.length ? ' — ' + i.options.map((o) => o.value).join(', ') : ''}{i.sku ? ` (${i.sku})` : ''}</span>
                  <b>{i.qty} adet</b>
                </div>
              ))}
            </div>
            {msg && <div className="formMsg err">{msg}</div>}
            <div className="row">
              <div className="field"><label>Ad Soyad <span className="req">*</span></label>
                <input className={errs.name ? 'err' : ''} value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
              <div className="field"><label>Firma</label>
                <input value={f.company} onChange={(e) => set('company', e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="field"><label>E-posta <span className="req">*</span></label>
                <input className={errs.email ? 'err' : ''} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
              <div className="field"><label>Telefon <span className="req">*</span></label>
                <input className={errs.phone ? 'err' : ''} value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="field"><label>Vergi Dairesi</label>
                <input value={f.taxOffice} onChange={(e) => set('taxOffice', e.target.value)} /></div>
              <div className="field"><label>Vergi No</label>
                <input value={f.taxNo} onChange={(e) => set('taxNo', e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="field"><label>Şehir</label>
                <input value={f.city} onChange={(e) => set('city', e.target.value)} /></div>
              <div className="field"><label>Teslimat Adresi</label>
                <input value={f.address} onChange={(e) => set('address', e.target.value)} /></div>
            </div>
            <div className="field"><label>Notlar</label>
              <textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Teslimat süresi, miktar, özel istekler..." /></div>
            <label className="kvkk">
              <input type="checkbox" checked={f.kvkk} onChange={(e) => set('kvkk', e.target.checked)} />
              <span>Kişisel verilerimin teklif süreci kapsamında işlenmesine ilişkin <a href="/kvkk" target="_blank">KVKK Aydınlatma Metni</a>’ni okudum ve onaylıyorum. <span className="req">*</span></span>
            </label>
            <button className="submitBtn" disabled={busy} onClick={submit}>{busy ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}</button>
            <button className="chip" style={{ background: 'transparent', color: 'var(--muted)', marginTop: 12 }} onClick={onBack}>← Sepete dön</button>
          </div>
        )}
      </div>
    </>
  );
}
