'use client';
import { useState } from 'react';

// Boş/eksik görseller için hafif gri placeholder (SVG data-URI)
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
       <rect width='100%' height='100%' fill='#eef2f6'/>
       <g fill='none' stroke='#b6c2cf' stroke-width='6'>
         <rect x='45' y='55' width='110' height='90' rx='8'/>
         <circle cx='78' cy='88' r='12'/>
         <path d='M55 138l34-30 22 18 20-16 24 28'/>
       </g>
       <text x='100' y='175' font-family='Arial' font-size='13' fill='#9fb0bf' text-anchor='middle'>Görsel yok</text>
     </svg>`
  );

/**
 * Önce yerel görseli (public/urunler/...) dener, gelmezse uzak (kaynak) URL'ye,
 * o da gelmezse placeholder'a düşer. Böylece hiçbir kart boş kalmaz.
 */
export default function ProductImage({ local, remote, alt }) {
  const chain = [local, remote, PLACEHOLDER].filter(Boolean);
  const [idx, setIdx] = useState(0);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={chain[idx]}
      alt={alt || ''}
      loading="lazy"
      onError={() => { if (idx < chain.length - 1) setIdx(idx + 1); }}
    />
  );
}
