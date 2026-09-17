'use client';
import { useState } from 'react';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) { setMsg({ t: 'Yeni şifre en az 8 karakter olmalı.' }); return; }
    if (next !== confirm) { setMsg({ t: 'Yeni şifreler eşleşmiyor.' }); return; }
    setBusy(true);
    const res = await fetch('/api/admin/password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current, next }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ t: d.error || 'Değiştirilemedi.' }); return; }
    setMsg({ ok: 1, t: 'Şifreniz güncellendi.' });
    setCurrent(''); setNext(''); setConfirm('');
  };

  return (
    <form className="panel" style={{ maxWidth: 440 }} onSubmit={submit}>
      {msg && <div className={'formMsg' + (msg.ok ? '' : ' err')} style={msg.ok ? { background: '#e6f7ec', color: '#1c8a4d' } : {}}>{msg.t}</div>}
      <div className="field"><label>Mevcut Şifre</label>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></div>
      <div className="field"><label>Yeni Şifre (en az 8 karakter)</label>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></div>
      <div className="field"><label>Yeni Şifre (tekrar)</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></div>
      <button className="btn" disabled={busy}>{busy ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}</button>
    </form>
  );
}
