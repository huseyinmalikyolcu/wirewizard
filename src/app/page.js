import { prisma } from '@/lib/prisma';
import Catalog from '@/components/Catalog';
import { cleanHtml } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [rawProducts, rawCategories] = await Promise.all([
    prisma.product.findMany({
      where: { isVisible: true },
      include: {
        category: true,
        options: { include: { values: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  // istemciye sade veri gönder
  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    type: p.type,
    shortDesc: p.shortDesc,
    descHtml: cleanHtml(p.descHtml),
    image: encodeURI(p.image),
    localImage: '/urunler/' + p.slug + '.jpg',
    sourceUrl: p.sourceUrl,
    categoryName: p.category?.name || '',
    categorySlug: p.category?.slug || '',
    options: p.options.map((o) => ({ name: o.name, values: o.values.map((v) => v.value) })),
  }));

  const categories = rawCategories.map((c) => ({ slug: c.slug, name: c.name }));

  return <Catalog products={products} categories={categories} />;
}
