import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProduct() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  return (
    <div>
      <div className="adminHead"><div><a href="/admin/urunler" className="link">← Ürünler</a><h1 style={{ marginTop: 6 }}>Yeni Ürün</h1></div></div>
      <ProductForm product={null} categories={categories} />
    </div>
  );
}
