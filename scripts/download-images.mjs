// Tüm ürün görsellerini public/urunler/<slug>.jpg olarak indirir.
// Çalıştırma: node scripts/download-images.mjs
// (Görseller yerelden sunulur; kaynağa bağımlılık ve hotlink sorunu ortadan kalkar.)
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public', 'urunler');
mkdirSync(outDir, { recursive: true });

const products = JSON.parse(readFileSync(join(root, 'prisma', 'products.json'), 'utf8'));
let ok = 0, skip = 0, fail = 0;

for (const p of products) {
  if (!p.image) { skip++; continue; }
  const dest = join(outDir, `${p.slug}.jpg`);
  if (existsSync(dest)) { skip++; continue; }
  try {
    const res = await fetch(encodeURI(p.image));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    ok++;
    process.stdout.write(`\r  indirildi: ${ok}  atlandı: ${skip}  hata: ${fail}   `);
  } catch (e) {
    fail++;
    console.log(`\n  HATA (${p.slug}): ${e.message}`);
  }
}
console.log(`\nTamamlandı → indirildi: ${ok}, atlandı: ${skip}, hata: ${fail}`);
console.log('Görseller public/urunler/ içinde. Site otomatik olarak yerel görselleri kullanır.');
