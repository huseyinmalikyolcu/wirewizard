'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductForm({ product, categories }) {
  const router = useRouter();
  const editing = !!product;
  const [f, setF] = useState({
    name: product?.name || '', sku: product?.sku || '',
    categoryId: product?.categoryId || '', sortOrder: product?.sortOrder ?? 0,
    image: product?.image || '', shortDesc: product?.shortDesc || '',
    descHtml: product?.descHtml || '', isVisible: product?.isVisible ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(''); setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploading(false);
    e.target.value = '';
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || 'Görsel yüklenemedi'); return; }
    const d = await res.json();
    set('image', d.path);
  };

  const save = async () => {
    if (!f.name.trim()) { setErr('Ürün adı gerekli'); return; }
    setErr(''); setBusy(true);
    const url = editing ? `/api/admin/products/${product.id}` : '/api/admin/products';
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f),
    });
    setBusy(false);
    if (!res.ok) { setErr('Kaydedilemedi'); return; }
    router.push('/admin/urunler'); router.refresh();
  };

  const remove = async () => {
    if (!confirm('Bu ürün kalıcı olarak silinsin mi?')) return;
    setBusy(true);
    await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    router.push('/admin/urunler'); router.refresh();
  };

  return (
    <div className="panel" style={{ maxWidth: 720 }}>
      {err && <div className="formMsg err">{err}</div>}
      <div className="field"><label>Ürün Adı *</label>
        <input value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div className="row">
        <div className="field"><label>Ürün Kodu (SKU)</label>
          <input value={f.sku} onChange={(e) => set('sku', e.target.value)} /></div>
        <div className="field"><label>Kategori</label>
          <select value={f.categoryId || ''} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">— Seçiniz —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
      </div>
      <div className="field" style={{ maxWidth: 240 }}><label>Sıra (küçük = üstte)</label>
        <input type="number" value={f.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} /></div>
      <div className="field">
        <label>Ürün Görseli</label>
        <div className="uploader">
          <div className="upPreview">
            {f.image
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={f.image} alt="" />
              : <span>Görsel yok</span>}
          </div>
          <div>
            <input id="upfile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={onPickFile} />
            <label htmlFor="upfile" className="btn ghost" style={{ cursor: 'pointer' }}>{uploading ? 'Yükleniyor...' : (f.image ? 'Görseli Değiştir' : 'Görsel Yükle')}</label>
            {f.image && <button type="button" className="btn danger" style={{ marginLeft: 8 }} onClick={() => set('image', '')}>Kaldır</button>}
            <div className="small" style={{ marginTop: 7 }}>JPG, PNG, WEBP · en fazla 5 MB</div>
          </div>
        </div>
      </div>
      <div className="field"><label>Kısa Açıklama</label>
        <textarea value={f.shortDesc} onChange={(e) => set('shortDesc', e.target.value)} /></div>
      <div className="field"><label>Detaylı Açıklama (HTML olabilir)</label>
        <textarea style={{ minHeight: 140 }} value={f.descHtml} onChange={(e) => set('descHtml', e.target.value)} /></div>
      <label className="checkRow">
        <input type="checkbox" checked={f.isVisible} onChange={(e) => set('isVisible', e.target.checked)} /> Sitede görünür
      </label>
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        <button className="btn" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor...' : (editing ? 'Kaydet' : 'Ürün Ekle')}</button>
        <a className="btn ghost" href="/admin/urunler">İptal</a>
        {editing && <button className="btn danger" style={{ marginLeft: 'auto' }} disabled={busy} onClick={remove}>Sil</button>}
      </div>
    </div>
  );
}
