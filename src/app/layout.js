import './globals.css';
import CartProvider from '@/components/CartProvider';

export const metadata = {
  title: 'AGEN — Kaynak Tel İletim & Torç Ekipmanları',
  description: 'Robotik ve yarı otomatik kaynak için tel iletim, torç ve sarf ekipmanları kataloğu.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
