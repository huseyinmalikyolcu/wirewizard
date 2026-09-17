'use client';
export default function PrintButton() {
  return <button className="btn noprint" onClick={() => window.print()}>Yazdır / PDF olarak kaydet</button>;
}
