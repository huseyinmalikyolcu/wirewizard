export const STATUSES = [
  { key: 'new', label: 'Yeni', color: '#f5821f' },
  { key: 'contacted', label: 'İletişimde', color: '#2980b9' },
  { key: 'quoted', label: 'Teklif Verildi', color: '#8e44ad' },
  { key: 'closed', label: 'Kapandı', color: '#1c8a4d' },
];
export const statusMap = Object.fromEntries(STATUSES.map((s) => [s.key, s]));
export const statusLabel = (k) => statusMap[k]?.label || k;
export const statusColor = (k) => statusMap[k]?.color || '#6b7886';
