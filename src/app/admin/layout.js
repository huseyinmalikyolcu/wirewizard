import { getSession } from '@/lib/auth';
import { SITE } from '@/lib/config';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Yönetim — ' + SITE.brand };

export default async function AdminLayout({ children }) {
  const session = await getSession();

  // Oturum yoksa (örn. giriş sayfası) çıplak göster
  if (!session) return <div className="adminBare">{children}</div>;

  return (
    <div className="adminLayout">
      <AdminNav session={session} />
      <main className="adminMain">{children}</main>
    </div>
  );
}
