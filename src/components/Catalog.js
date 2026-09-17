'use client';
import { useMemo, useState } from 'react';
import Header from './Header';
import CartDrawer from './CartDrawer';
import ProductImage from './ProductImage';
import Icon from './Icon';
import { useCart } from './CartProvider';
import { SITE } from '@/lib/config';

export default function Catalog({ products, categories }) {
  const { add, toast } = useCart();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [active, setActive] = useState(null); // açık ürün (modal)

  const counts = useMemo(() => {
    const c = { all: products.length };
    products.forEach((p) => { if (p.categorySlug) c[p.categorySlug] = (c[p.categorySlug] || 0) + 1; });
    return c;
  }, [products]);

  const catList = useMemo(() => {
    const arr = categories.filter((c) => counts[c.slug]);
    return [{ slug: 'all', name: 'Tüm Ürünler' }, ...arr];
  }, [categories, counts]);

  const filtered = useMemo(() => {
    let r = products;
    if (cat !== 'all') r = r.filter((p) => p.categorySlug === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((p) => (p.name + ' ' + p.sku + ' ' + p.shortDesc + ' ' + (p.categoryName || '')).toLowerCase().includes(s));
    }
    return r;
  }, [products, cat, q]);

  const title = cat === 'all' ? 'Tüm Ürünler' : (categories.find((c) => c.slug === cat)?.name || '');

  return (
    <>
      <div className="stickyTop">
        <Header search={q} onSearch={setQ} />
      </div>

      <section className="topbar">
        <div className="inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tLogo" src="/wire-wizard-logo.png" alt="Wire Wizard" />
          <div>
            <div className="tTitle">Wire Wizard® Türkiye Yetkili Distribütörü</div>
            <div className="tSub">Robotik ve yarı otomatik kaynak için tel iletim, torç ve sarf ekipmanları — {products.length}+ ürün</div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <aside className="side">
          <h3>Kategoriler</h3>
          <div className="catlist">
            {catList.map((c) => (
              <button key={c.slug} className={cat === c.slug ? 'active' : ''}
                onClick={() => { setCat(c.slug); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span>{c.name}</span><span className="cnt">{counts[c.slug] || 0}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="main">
          <h1>{title}</h1>
          <div className="crumb">Anasayfa › {title}</div>
          <div className="toolbar">
            <span className="count">{filtered.length} ürün listeleniyor</span>
            {q.trim() && <button className="chip" onClick={() => setQ('')}>Arama: “{q}” ✕</button>}
          </div>

          <div className="grid">
            {filtered.length === 0 && <div className="empty">Sonuç bulunamadı. Farklı bir kelime deneyin.</div>}
            {filtered.map((p) => {
              const variable = p.type === 'variable' || p.options.length > 0;
              return (
                <div className="card" key={p.id}>
                  <div className="thumb" onClick={() => setActive(p)}>
                    <ProductImage local={p.localImage} remote={p.image} alt={p.name} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="brandBadge" src="/wire-wizard-logo.png" alt="Wire Wizard" />
                  </div>
                  <div className="cbody">
                    <div className="cat">{p.categoryName}</div>
                    <h4 onClick={() => setActive(p)}>{p.name}</h4>
                    <div className="brandLine">Marka: <b>{SITE.supplierBrand}</b></div>
                    {p.sku && <div className="sku">Kod: {p.sku}</div>}
                    <p>{p.shortDesc}</p>
                    {variable
                      ? <button className="addbtn opt" onClick={() => setActive(p)}>Seçenekleri Gör</button>
                      : <button className="addbtn" onClick={() => { add(p, 1, []); toast('Ürün sepete eklendi'); }}>+ Sepete Ekle</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {active && <ProductModal product={active} onClose={() => setActive(null)} />}
      <CartDrawer products={products} />

      <footer className="site"><div className="inner">
        <div className="footerBrand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="footerLogo" src="/agen-logo-white.png" alt={`${SITE.brand} ${SITE.tagline}`}
            onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/logo-white.svg'; } }} />
          <p style={{ margin: '12px 0 0', color: '#9fb4c9' }}>Robotik & yarı otomatik kaynak için tel iletim, torç ve sarf ekipmanları.</p>
        </div>
        <div className="distBlock">
          <div className="distLabel">Yetkili Distribütör</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="supplierLogo" src={SITE.supplierLogo} alt={SITE.supplierBrand}
            onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/wire-wizard-wordmark.svg'; } }} />
          <div className="small" style={{ marginTop: 8, color: '#8a9099' }}>{SITE.footerNote}</div>
        </div>
        <div>
          <a className="footLink" href={`mailto:${SITE.email}`}><Icon name="mail" size={14} /> {SITE.email}</a><br />
          <a className="footLink" href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`}><Icon name="phone" size={14} /> {SITE.phone}</a>
        </div>
      </div></footer>
    </>
  );
}

function ProductModal({ product, onClose }) {
  const { add, toast } = useCart();
  const [sel, setSel] = useState(() => product.options.map((o) => o.values[0]));
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    const opts = product.options.map((o, i) => ({ name: o.name, value: sel[i] }));
    add(product, qty, opts);
    toast('Ürün sepete eklendi');
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal">
        <div className="mhead"><button className="close" onClick={onClose}>×</button></div>
        <div className="pdetail">
          <div className="pgal">
            <ProductImage local={product.localImage} remote={product.image} alt={product.name} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brandBadge lg" src="/wire-wizard-logo.png" alt="Wire Wizard" />
          </div>
          <div className="pinfo">
            <div className="cat">{product.categoryName}</div>
            <h2>{product.name}</h2>
            <div className="brandLine" style={{ marginBottom: 6 }}>Marka: <b>{SITE.supplierBrand}</b></div>
            {product.sku && <div className="sku">Ürün Kodu: {product.sku}</div>}
            {product.options.map((o, i) => (
              <div className="optrow" key={i}>
                <label>{o.name}</label>
                <select value={sel[i]} onChange={(e) => { const n = [...sel]; n[i] = e.target.value; setSel(n); }}>
                  {o.values.map((v, j) => <option key={j} value={v}>{v}</option>)}
                </select>
              </div>
            ))}
            <div className="qtyrow">
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button className="addbtn" style={{ flex: 1 }} onClick={addToCart}>+ Teklif Sepetine Ekle</button>
            </div>
            {product.descHtml
              ? <div className="desc" dangerouslySetInnerHTML={{ __html: product.descHtml }} />
              : <div className="desc"><p>{product.shortDesc}</p></div>}
            {product.sourceUrl && <a className="srclink" href={product.sourceUrl} target="_blank" rel="noopener noreferrer">Üretici teknik sayfası ↗</a>}
          </div>
        </div>
      </div>
    </>
  );
}
