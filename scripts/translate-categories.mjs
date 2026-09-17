// Kategori adlarını prisma/categories.json'daki (Türkçe) adlarla günceller.
// Sadece kategori ADLARINI değiştirir; ürünler, teklifler ve diğer veriler korunur.
// Çalıştırma: node scripts/translate-categories.mjs
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  const cats = JSON.parse(readFileSync(join(__dirname, '..', 'prisma', 'categories.json'), 'utf8'));
  let updated = 0;
  for (const c of cats) {
    const res = await prisma.category.updateMany({ where: { slug: c.slug }, data: { name: c.name } });
    if (res.count) updated += res.count;
  }
  console.log(`Güncellenen kategori: ${updated}/${cats.length}`);
  console.log('Kategori adları Türkçeleştirildi. Siteyi yenileyin.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
