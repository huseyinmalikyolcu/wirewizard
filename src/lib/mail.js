import nodemailer from 'nodemailer';
import { SITE } from './config';
import { tl } from './format';

// SMTP yapılandırması .env'den okunur. Yapılandırılmamışsa e-posta atlanır
// (teklif yine de veritabanına kaydedilir).
function getTransport() {
  const { SMTP_HOST, SMTP_PORT } = process.env;
  if (!SMTP_HOST) return null;
  const port = Number(SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

const esc = (s) => String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function itemsTable(items) {
  const rows = items.map((i, n) => {
    const opts = (i.options || []).map((o) => `${esc(o.name)}: ${esc(o.value)}`).join(', ');
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee">${n + 1}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee">${esc(i.productName)}${opts ? `<br><span style="color:#888;font-size:12px">${opts}</span>` : ''}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;color:#666">${esc(i.sku)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;font-weight:700">${esc(i.qty)}</td>
    </tr>`;
  }).join('');
  return `<table style="border-collapse:collapse;width:100%;font-size:14px;margin-top:10px">
    <thead><tr style="background:#0f2742;color:#fff">
      <th style="padding:8px 10px;text-align:left">#</th>
      <th style="padding:8px 10px;text-align:left">Ürün</th>
      <th style="padding:8px 10px;text-align:left">Kod</th>
      <th style="padding:8px 10px">Adet</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
}

function row(label, val) {
  if (!val) return '';
  return `<tr><td style="padding:3px 10px 3px 0;color:#888">${label}</td><td style="padding:3px 0;font-weight:600">${esc(val)}</td></tr>`;
}

export async function sendQuoteEmails({ id, customer: c, items }) {
  const t = getTransport();
  if (!t) {
    console.log(`[mail] SMTP yapılandırılmadı; e-posta atlandı. Teklif #${id} kaydedildi.`);
    return { sent: false };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || SITE.email;
  const salesTo = process.env.SALES_EMAIL || SITE.email;
  const base = (process.env.SITE_URL || 'https://wirewizard.agenrobotics.com').replace(/\/$/, '');

  // 1) Satış ekibine bildirim
  const salesHtml = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1d2733">
      <div style="background:#0f2742;color:#fff;padding:16px 20px;border-radius:10px 10px 0 0">
        <h2 style="margin:0">Yeni Teklif Talebi #${id}</h2>
      </div>
      <div style="border:1px solid #e3e8ee;border-top:0;padding:18px 20px;border-radius:0 0 10px 10px">
        <h3 style="margin:0 0 6px">Müşteri Bilgileri</h3>
        <table style="font-size:14px">
          ${row('Ad Soyad', c.name)}${row('Firma', c.company)}${row('E-posta', c.email)}
          ${row('Telefon', c.phone)}${row('Vergi Dairesi', c.taxOffice)}${row('Vergi No', c.taxNo)}
          ${row('Şehir', c.city)}${row('Adres', c.address)}
        </table>
        ${c.notes ? `<p style="margin:12px 0 0"><b>Notlar:</b><br>${esc(c.notes)}</p>` : ''}
        <h3 style="margin:18px 0 0">Talep Edilen Ürünler</h3>
        ${itemsTable(items)}
        <p style="margin:22px 0 6px;text-align:center">
          <a href="${base}/admin/teklif/${id}" style="display:inline-block;background:#e30613;color:#fff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Teklifi Yönetim Panelinde Aç</a>
        </p>
        <p style="color:#888;font-size:12px;margin-top:16px">Bu e-posta ${SITE.brand} katalog sitesinden otomatik gönderilmiştir. Yanıtladığınızda doğrudan müşteriye ulaşır.</p>
      </div>
    </div>`;

  // 2) Müşteriye teşekkür / onay
  const custHtml = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1d2733">
      <div style="background:#0f2742;color:#fff;padding:18px 20px;border-radius:10px 10px 0 0">
        <h2 style="margin:0">${SITE.brand}</h2>
      </div>
      <div style="border:1px solid #e3e8ee;border-top:0;padding:20px;border-radius:0 0 10px 10px">
        <p>Sayın ${esc(c.name)},</p>
        <p>Teklif talebiniz tarafımıza ulaşmıştır (Talep No: <b>#${id}</b>). Satış ekibimiz en kısa
        sürede sizinle iletişime geçerek fiyat teklifinizi iletecektir.</p>
        <h3 style="margin:18px 0 0">Talebinizin Özeti</h3>
        ${itemsTable(items)}
        <p style="margin-top:18px">İlginiz için teşekkür ederiz.<br><b>${SITE.brand} ${SITE.tagline}</b><br>
        E-posta: ${SITE.email} &nbsp;&nbsp; Tel: ${SITE.phone}</p>
      </div>
    </div>`;

  await t.sendMail({ from, to: salesTo, replyTo: c.email, subject: `Yeni Teklif Talebi #${id} — ${c.company || c.name}`, html: salesHtml });
  if (c.email) {
    await t.sendMail({ from, to: c.email, subject: `Teklif talebiniz alındı (#${id}) — ${SITE.brand}`, html: custHtml });
  }
  return { sent: true };
}

// Fiyatlı teklifi müşteriye gönderir
export async function sendOfferEmail(quote) {
  const t = getTransport();
  const subtotal = quote.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const vat = subtotal * (quote.vatRate || 0) / 100;
  const total = subtotal + vat;

  const rows = quote.items.map((i, n) => {
    const opts = parseOptsSafe(i.options).map((o) => `${esc(o.name)}: ${esc(o.value)}`).join(', ');
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee">${n + 1}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee">${esc(i.productName)}${opts ? `<br><span style="color:#888;font-size:12px">${opts}</span>` : ''}${i.sku ? `<br><span style="color:#aaa;font-size:11px">${esc(i.sku)}</span>` : ''}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right">${tl(i.unitPrice)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:700">${tl(i.unitPrice * i.qty)}</td>
    </tr>`;
  }).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#16181c">
      <div style="background:#15171a;color:#fff;padding:18px 20px;border-radius:10px 10px 0 0;border-bottom:3px solid #e30613">
        <h2 style="margin:0">${SITE.brand} — Fiyat Teklifi</h2>
        <div style="color:#b9bfc6;font-size:13px;margin-top:3px">Teklif No: #${quote.id}</div>
      </div>
      <div style="border:1px solid #e6e8eb;border-top:0;padding:20px;border-radius:0 0 10px 10px">
        <p>Sayın ${esc(quote.name)},</p>
        <p>Talebiniz için hazırladığımız fiyat teklifi aşağıdadır:</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;margin-top:8px">
          <thead><tr style="background:#15171a;color:#fff">
            <th style="padding:8px 10px;text-align:left">#</th>
            <th style="padding:8px 10px;text-align:left">Ürün</th>
            <th style="padding:8px 10px">Adet</th>
            <th style="padding:8px 10px;text-align:right">Birim</th>
            <th style="padding:8px 10px;text-align:right">Tutar</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <table style="width:100%;margin-top:14px;font-size:14px">
          <tr><td style="text-align:right;padding:3px 10px;color:#666">Ara Toplam</td><td style="text-align:right;width:130px;padding:3px 0">${tl(subtotal)}</td></tr>
          <tr><td style="text-align:right;padding:3px 10px;color:#666">KDV (%${quote.vatRate || 0})</td><td style="text-align:right;padding:3px 0">${tl(vat)}</td></tr>
          <tr><td style="text-align:right;padding:8px 10px;font-weight:800;font-size:16px">Genel Toplam</td><td style="text-align:right;padding:8px 0;font-weight:800;font-size:16px;color:#e30613">${tl(total)}</td></tr>
        </table>
        ${quote.notes ? `<p style="margin-top:14px;font-size:13px;color:#666"><b>Müşteri notu:</b> ${esc(quote.notes)}</p>` : ''}
        <p style="margin-top:18px">Sorularınız için bize ulaşabilirsiniz.<br><b>${SITE.brand} ${SITE.tagline}</b><br>
        E-posta: ${SITE.email} &nbsp;&nbsp; Tel: ${SITE.phone}</p>
        <p style="color:#aaa;font-size:11px;margin-top:14px">Bu teklif bilgilendirme amaçlıdır; fiyatlar ve stok durumu değişiklik gösterebilir.</p>
      </div>
    </div>`;

  if (!t) {
    console.log(`[mail] SMTP yok; fiyatlı teklif e-postası atlandı. Teklif #${quote.id}, toplam ${tl(total)}.`);
    return { sent: false, total };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || SITE.email;
  await t.sendMail({ from, to: quote.email, replyTo: SITE.email, subject: `Fiyat Teklifi #${quote.id} — ${SITE.brand}`, html });
  return { sent: true, total };
}

function parseOptsSafe(s) { try { return JSON.parse(s || '[]'); } catch { return []; } }
