import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProduct({ params }) {
  await requireAdmin();
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);
  if (!product) notFound();
  return (
    <div>
      <div className="adminHead"><div><a href="/admin/urunler" className="link">← Ürünler</a><h1 style={{ marginTop: 6 }}>{product.name}</h1></div></div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
