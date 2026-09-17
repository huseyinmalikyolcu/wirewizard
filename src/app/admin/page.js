import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { STATUSES, statusLabel, statusColor } from '@/lib/status';
import Icon from '@/components/Icon';
import QuoteRow from '@/components/admin/QuoteRow';

export const dynamic = 'force-dynamic';

export default async function QuotesPage({ searchParams }) {
  await requireAdmin();
  const status = searchParams?.status || '';
  const q = (searchParams?.q || '').trim();
  const from = searchParams?.from || '';
  const to = searchParams?.to || '';

  const where = {};
  if (status) where.status = status;
  if (q) where.OR = [
    { name: { contains: q } }, { company: { contains: q } },
    { email: { contains: q } }, { phone: { contains: q } },
  ];
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
  }

  const [quotes, counts] = await Promise.all([
    prisma.quote.findMany({ where, orderBy: { createdAt: 'desc' }, include: { _count: { select: { items: true } } } }),
    prisma.quote.groupBy({ by: ['status'], _count: true }),
  ]);
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = counts.reduce((s, c) => s + c._count, 0);

  const qs = (over) => {
    const p = new URLSearchParams();
    const merged = { status, q, from, to, ...over };
    for (const k of ['status', 'q', 'from', 'to']) if (merged[k]) p.set(k, merged[k]);
    const s = p.toString();
    return '/admin' + (s ? '?' + s : '');
  };
  const exportUrl = `/api/admin/quotes/export?status=${encodeURIComponent(status)}&q=${encodeURIComponent(q)}`;

  return (
    <div>
      <div className="adminHead">
        <h1>Teklifler</h1>
        <a className="btn" href={exportUrl}><Icon name="download" size={16} /> Excel'e Aktar</a>
      </div>

      <div className="filters">
        <a className={'fchip' + (!status ? ' on' : '')} href={qs({ status: '' })}>Tümü <b>{total}</b></a>
        {STATUSES.map((s) => (
          <a key={s.key} className={'fchip' + (status === s.key ? ' on' : '')} href={qs({ status: s.key })}>{s.label} <b>{countByStatus[s.key] || 0}</b></a>
        ))}
      </div>

      <form className="filters" action="/admin" method="get" style={{ marginTop: -4 }}>
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Ad, firma, e-posta, telefon ara..." style={{ minWidth: 220 }} />
        <label className="small">Tarih:</label>
        <input type="date" name="from" defaultValue={from} />
        <span className="small">–</span>
        <input type="date" name="to" defaultValue={to} />
        <button className="btn" style={{ padding: '8px 16px' }}>Filtrele</button>
        {(q || from || to) && <a className="btn ghost" style={{ padding: '8px 14px' }} href={qs({ q: '', from: '', to: '' })}>Temizle</a>}
      </form>

      {quotes.length === 0 ? (
        <div className="adminEmpty">Kayıt bulunamadı.</div>
      ) : (
        <table className="adminTable">
          <thead><tr><th>#</th><th>Tarih</th><th>Müşteri</th><th>Firma</th><th>İletişim</th><th>Ürün</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            {quotes.map((qt) => (
              <QuoteRow key={qt.id} id={qt.id}>
                <td>#{qt.id}</td>
                <td>{new Date(qt.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>
                  <span className="link">{qt.name}</span>
                  {!qt.isRead && <span className="newTag">Yeni</span>}
                </td>
                <td>{qt.company || '—'}</td>
                <td className="small">{qt.email}<br />{qt.phone}</td>
                <td style={{ textAlign: 'center' }}>{qt._count.items} ürün</td>
                <td><span className="stbadge" style={{ background: statusColor(qt.status) }}>{statusLabel(qt.status)}</span></td>
                <td><span className="btn ghost" style={{ padding: '6px 12px', fontSize: 13 }}>Detay →</span></td>
              </QuoteRow>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
