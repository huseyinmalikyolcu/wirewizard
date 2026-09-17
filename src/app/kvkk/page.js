import { SITE } from '@/lib/config';

export const metadata = { title: 'KVKK Aydınlatma Metni' };

export default function Kvkk() {
  return (
    <main className="container" style={{ maxWidth: 820 }}>
      <a href="/" style={{ color: 'var(--accent)', fontSize: 14 }}>← Anasayfa</a>
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="muted">Bu metin bir taslaktır; yayına geçmeden önce bir hukuk danışmanı ile son hâline getirilmelidir.</p>
      <div style={{ lineHeight: 1.7, fontSize: 15 }}>
        <p>{SITE.brand} olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri
          sorumlusu sıfatıyla, teklif talebiniz sırasında paylaştığınız ad-soyad, firma, e-posta, telefon,
          vergi ve adres bilgilerinizi; talebinizi değerlendirmek, size fiyat teklifi sunmak ve satış süreçlerini
          yürütmek amacıyla işlemekteyiz.</p>
        <p>Verileriniz, yalnızca bu amaçlarla ve mevzuatın öngördüğü süreler boyunca saklanır; açık rızanız
          olmaksızın üçüncü kişilerle paylaşılmaz.</p>
        <p>KVKK’nın 11. maddesi uyarınca; verilerinize erişme, düzeltilmesini veya silinmesini talep etme
          haklarına sahipsiniz. Taleplerinizi <b>{SITE.email}</b> adresine iletebilirsiniz.</p>
      </div>
    </main>
  );
}
