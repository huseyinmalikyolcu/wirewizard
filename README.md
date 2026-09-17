# AGEN B2B Katalog & Teklif Sistemi

Next.js (App Router) + Prisma + SQLite (geliştirme) / PostgreSQL (yayın) ile kurulan,
admin panelli, "Teklif Al" akışlı B2B ürün kataloğu.

> **Durum:** Aşama 1–4 ✓ · Aşama 5 ✓ (AGEN teması: siyah+kırmızı, logo, hero — agenrobotics.com
> tarzı). Sıradaki: Aşama 6 (yayına alma).
>
> **Admin panel:** `http://localhost:3000/admin` · giriş `admin@weldline.com` / `admin123`.
>
> **Marka:** `src/lib/config.js` (AGEN adı, iletişim, logo yolları). Logolar `public/logo.svg`
> ve `public/logo-white.svg` — kendi PNG/SVG dosyanızla değiştirebilirsiniz. Renkler
> `src/app/globals.css` en üstteki `:root` değişkenlerinden.

## Gereksinimler

- Node.js 18+ (öneri: 20)
- npm

## Kurulum (yerel — SQLite)

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Veritabanını oluştur + 273 ürünü aktar (tek komut)
npm run setup
#   = prisma generate + prisma db push + node prisma/seed.mjs

# 3) Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` → ürün sayısı ve örnek ürünler veritabanından gelir.

### Faydalı komutlar

```bash
npm run db:push   # şemayı veritabanına uygula
npm run db:seed   # ürünleri yeniden yükle
npx prisma studio # veritabanını görsel arayüzde incele
```

## Proje yapısı

```
weldline-app/
├── prisma/
│   ├── schema.prisma     → Veritabanı şeması (Product, Category, Quote, AdminUser ...)
│   ├── seed.mjs          → 273 ürün + kategori + admin kullanıcısı aktarımı
│   ├── products.json     → Ürün verisi (273)
│   └── categories.json   → Kategoriler (40)
├── src/
│   ├── app/
│   │   ├── layout.js     → Genel şablon
│   │   ├── page.js       → Anasayfa (şimdilik kurulum doğrulama paneli)
│   │   └── globals.css
│   └── lib/prisma.js     → Prisma istemcisi
├── .env                  → DATABASE_URL, AUTH_SECRET, SALES_EMAIL
├── next.config.mjs
└── package.json
```

## Veritabanı modeli (özet)

- **Product / Category / ProductOption / ProductOptionValue** — katalog ve varyasyonlar
- **Quote / QuoteItem** — gelen teklifler ve içindeki ürünler (müşteri bilgileri + KVKK)
- **AdminUser** — panel girişi

## Admin girişi (varsayılan)

Seed sonrası oluşur: **e-posta** `admin@weldline.com` · **şifre** `admin123`
(Admin paneli Aşama 4'te eklenecek; ilk girişte şifreyi değiştirin.)

## Yayına geçiş (Aşama 6'da birlikte)

`prisma/schema.prisma` içindeki `provider = "sqlite"` → `"postgresql"` yapılır ve
`.env` içindeki `DATABASE_URL` canlı PostgreSQL bağlantısıyla değiştirilir. Uygulama
Vercel'e, veritabanı Neon/Supabase'e alınır.
