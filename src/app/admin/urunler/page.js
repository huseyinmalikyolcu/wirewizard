import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import VisibilityToggle from '@/components/admin/VisibilityToggle';
import ProductImage from '@/components/ProductImage';

export const dynamic = 'force-dynamic';

export default async function ProductsAdmin({ searchParams }) {
  await requireAdmin();
  const q = (searchParams?.q || '').trim();
  const cat = searchParams?.cat || '';

  const where = {};
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];
  if (cat) where.category = { slug: cat };

  const [products, categories, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], take: 300 }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.count(),
  ]);

  return (
    <div>
      <div className="adminHead">
        <h1>Ürünler <span className="small" style={{ fontWeight: 400 }}>({total} toplam)</span></h1>
        <a className="btn" href="/admin/urunler/yeni">+ Yeni Ürün</a>
      </div>

      <div className="filters">
        <form className="searchForm" action="/admin/urunler" method="get">
          {cat && <input type="hidden" name="cat" value={cat} />}
          <input name="q" defaultValue={q} placeholder="Ürün adı veya kod ara..." />
          <button>Ara</button>
        </form>
        <form className="searchForm" action="/admin/urunler" method="get">
          {q && <input type="hidden" name="q" value={q} />}
          <select name="cat" defaultValue={cat}>
            <option value="">Tüm kategoriler</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <button>Filtrele</button>
        </form>
      </div>

      <table className="adminTable">
        <thead><tr><th></th><th>Ürün</th><th>Kod</th><th>Kategori</th><th>Sıra</th><th>Görünür</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="pthumb"><ProductImage local={'/urunler/' + p.slug + '.jpg'} remote={p.image} alt="" /></td>
              <td><a className="link" href={`/admin/urunler/${p.id}`}>{p.name}</a></td>
              <td className="small">{p.sku || '—'}</td>
              <td className="small">{p.category?.name || '—'}</td>
              <td style={{ textAlign: 'center' }} className="small">{p.sortOrder}</td>
              <td><VisibilityToggle id={p.id} value={p.isVisible} /></td>
              <td><a className="link" href={`/admin/urunler/${p.id}`}>Düzenle</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && <div className="adminEmpty">Ürün bulunamadı.</div>}
    </div>
  );
}
