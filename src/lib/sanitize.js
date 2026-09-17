import sanitizeHtml from 'sanitize-html';

// Ürün açıklamaları (HTML) güvenli etiketlere indirgenir — XSS önlenir.
export function cleanHtml(dirty) {
  return sanitizeHtml(String(dirty || ''), {
    allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'span', 'a', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'sup', 'sub', 'small'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      span: ['style'], div: ['style'], td: ['style', 'colspan', 'rowspan'], th: ['style', 'colspan', 'rowspan'],
    },
    allowedStyles: { '*': { 'text-align': [/^left$|^right$|^center$/], 'font-weight': [/^bold$|^\d+$/] } },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }) },
  });
}
