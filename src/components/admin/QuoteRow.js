'use client';
import { useRouter } from 'next/navigation';

export default function QuoteRow({ id, children }) {
  const router = useRouter();
  return (
    <tr className="rowlink" onClick={() => router.push(`/admin/teklif/${id}`)}>
      {children}
    </tr>
  );
}
