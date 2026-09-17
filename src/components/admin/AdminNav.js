'use client';
import { usePathname, useRouter } from 'next/navigation';
import { SITE } from '@/lib/config';
import Icon from '@/components/Icon';

const links = [
  { href: '/admin', label: 'Teklifler', icon: 'inbox' },
  { href: '/admin/urunler', label: 'Ürünler', icon: 'box' },
];

export default function AdminNav({ session }) {
  const path = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const isActive = (href) => (href === '/admin' ? path === '/admin' || path.startsWith('/admin/teklif') : path.startsWith(href));

  return (
    <aside className="adminNav">
      <div className="anLogo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/agen-logo-white.png" alt={SITE.brand} style={{ height: 30 }}
          onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/logo-white.svg'; } }} />
        <small>Yönetim Paneli</small>
      </div>
      <nav>
        {links.map((l) => (
          <a key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
            <Icon name={l.icon} size={19} /> {l.label}
          </a>
        ))}
        <a href="/" target="_blank"><Icon name="globe" size={19} /> Siteyi Gör</a>
      </nav>
      <div className="anFoot">
        <div className="anUser">{session.name || session.email}</div>
        <a href="/admin/sifre" style={{ display: 'block', color: '#9fb4c9', fontSize: 12.5, marginBottom: 9 }}>Şifre Değiştir</a>
        <button onClick={logout}><Icon name="logout" size={16} /> Çıkış Yap</button>
      </div>
    </aside>
  );
}
