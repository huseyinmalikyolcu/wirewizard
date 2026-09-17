'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUSES, statusColor } from '@/lib/status';

export default function StatusSelect({ id, current }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [saving, setSaving] = useState(false);

  const change = async (v) => {
    setStatus(v); setSaving(true);
    await fetch(`/api/admin/quotes/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: v }),
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <span className="statusSelect" style={{ borderColor: statusColor(status) }}>
      <span className="dot" style={{ background: statusColor(status) }} />
      <select value={status} disabled={saving} onChange={(e) => change(e.target.value)}>
        {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
    </span>
  );
}
