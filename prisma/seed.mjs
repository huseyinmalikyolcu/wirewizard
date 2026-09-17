// 273 ürün + kategorileri veritabanına aktarır, bir admin kullanıcısı oluşturur.
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { scryptSync, randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function hashPassword(pw) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const products = JSON.parse(readFileSync(join(__dirname, 'products.json'), 'utf8'));
  const categories = JSON.parse(readFileSync(join(__dirname, 'categories.json'), 'utf8'));

  console.log('Temizleniyor...');
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log(`Kategoriler ekleniyor (${categories.length})...`);
  // sortOrder: ürün sayısı çok olan üstte
  const sorted = [...categories].sort((a, b) => (b.count || 0) - (a.count || 0));
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    await prisma.category.create({
      data: { id: c.id, name: c.name, slug: c.slug, sortOrder: i },
    });
  }

  console.log(`Ürünler ekleniyor (${products.length})...`);
  let n = 0;
  for (const p of products) {
    const primary = (p.categories && p.categories[0]) || null;
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || '',
        type: p.type || 'simple',
        shortDesc: p.short_description || '',
        descHtml: p.description_html || '',
        image: p.image || '',
        sourceUrl: p.source_url || '',
        categoryId: primary ? primary.id : null,
        options: {
          create: (p.options || []).map((o) => ({
            name: o.name,
            values: { create: (o.values || []).map((v) => ({ value: v })) },
          })),
        },
      },
    });
    n++;
    if (n % 50 === 0) console.log(`  ${n}/${products.length}`);
  }

  // Varsayılan admin kullanıcısı
  const adminEmail = 'admin@weldline.com';
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: 'Yönetici', passwordHash: hashPassword('admin123') },
  });

  const counts = {
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    options: await prisma.productOption.count(),
  };
  console.log('\nTamamlandı:', counts);
  console.log('Admin girişi -> e-posta: admin@weldline.com  şifre: admin123  (ilk girişte değiştirin)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
