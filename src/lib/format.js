export function tl(n) {
  const v = Number(n) || 0;
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
}

// Telefon numarasını uluslararası sadeleştir: +90 362 502 14 16 -> 903625021416
export function digits(phone) {
  return String(phone || '').replace(/[^\d]/g, '');
}
