'use client';
import { useState } from 'react';

export default function VisibilityToggle({ id, value }) {
  const [on, setOn] = useState(value);
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    const next = !on; setOn(next); setBusy(true);
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: next }),
    });
    setBusy(false);
  };
  return (
    <button className={'toggle' + (on ? ' on' : '')} disabled={busy} onClick={toggle} title={on ? 'Görünür' : 'Gizli'}>
      <span className="knob" />
    </button>
  );
}
