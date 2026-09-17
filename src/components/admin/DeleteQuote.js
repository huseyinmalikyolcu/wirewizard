'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteQuote({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const del = async () => {
    if (!confirm('Bu teklif kalıcı olarak silinsin mi?')) return;
    setBusy(true);
    await fetch(`/api/admin/quotes/${id}`, { method: 'DELETE' });
    router.push('/admin');
    router.refresh();
  };
  return <button className="btn danger" disabled={busy} onClick={del}>Sil</button>;
}
