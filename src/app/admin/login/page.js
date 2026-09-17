'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SITE } from '@/lib/config';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) { setErr(d.error || 'Giriş başarısız'); setBusy(false); return; }
      router.push('/admin');
      router.refresh();
    } catch {
      setErr('Bağlantı hatası'); setBusy(false);
    }
  };

  return (
    <div className="loginWrap">
      <form className="loginCard" onSubmit={submit}>
        <div className="loginLogo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/agen-logo.png" alt={SITE.brand} style={{ height: 34 }}
            onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/logo.svg'; } }} />
          <span style={{ color: '#9aa0a6', fontWeight: 500, fontSize: 13 }}>Yönetim Paneli</span>
        </div>
        <h2>Giriş Yap</h2>
        {err && <div className="formMsg err">{err}</div>}
        <div className="field"><label>E-posta</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></div>
        <div className="field"><label>Şifre</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="submitBtn" disabled={busy}>{busy ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button>
      </form>
    </div>
  );
}
