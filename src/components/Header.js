'use client';
import { useCart } from './CartProvider';
import { SITE } from '@/lib/config';
import Icon from './Icon';

export default function Header({ search, onSearch }) {
  const { count, setOpen } = useCart();
  return (
    <header className="site">
      <div className="bar">
        <a className="logo" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brandLogo" src="/agen-logo.png" alt={`${SITE.brand} ${SITE.tagline}`}
            onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/logo.svg'; } }} />
        </a>
        <div className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Ürün, kod veya kelime ara..." />
        </div>
        <button className="cartBtn" onClick={() => setOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
          Teklif Sepeti<span className="badge">{count}</span>
        </button>
      </div>
      <div className="subbar"><div className="inner">
        <span><Icon name="truck" size={14} /> Türkiye geneli dağıtım</span>
        <span><Icon name="shield" size={14} /> Wire Wizard® ürünleri — Yetkili Distribütör</span>
        <span><Icon name="mail" size={14} /> <a className="subLink" href={`mailto:${SITE.email}`}>{SITE.email}</a></span>
        <span><Icon name="phone" size={14} /> <a className="subLink" href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`}>{SITE.phone}</a></span>
      </div></div>
    </header>
  );
}
