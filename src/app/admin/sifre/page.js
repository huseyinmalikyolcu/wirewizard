import { requireAdmin } from '@/lib/auth';
import ChangePassword from '@/components/admin/ChangePassword';

export const dynamic = 'force-dynamic';

export default async function PasswordPage() {
  const session = await requireAdmin();
  return (
    <div>
      <div className="adminHead"><h1>Şifre Değiştir</h1></div>
      <p className="small" style={{ marginTop: -8, marginBottom: 16 }}>Oturum: {session.email}</p>
      <ChangePassword />
    </div>
  );
}
