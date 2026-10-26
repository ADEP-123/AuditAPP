import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PdfPrinter = require('pdfmake');
const vfs = require('pdfmake/build/vfs_fonts.js');

// Roboto viene incluida en pdfmake y cubre tildes, ñ y símbolos usados en el informe.
const font = (name) => Buffer.from(vfs[name], 'base64');
const printer = new PdfPrinter({
  Roboto: {
    normal: font('Roboto-Regular.ttf'),
    bold: font('Roboto-Medium.ttf'),
    italics: font('Roboto-Italic.ttf'),
    bolditalics: font('Roboto-MediumItalic.ttf'),
  },
});

const HEAD_FILL = '#D9E2F3';
const layout = {
  hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#9AA3B2', vLineColor: () => '#9AA3B2',
  paddingLeft: () => 4, paddingRight: () => 4, paddingTop: () => 3, paddingBottom: () => 3,
};

const kv = (rows, header) => ({
  table: {
    widths: [150, '*'],
    headerRows: header ? 1 : 0,
    body: [
      ...(header ? [header.map((h) => ({ text: h, bold: true, fillColor: HEAD_FILL }))] : []),
      ...rows.map(([k, v]) => [{ text: k, bold: true, fillColor: HEAD_FILL }, { text: String(v ?? '') }]),
    ],
  },
  layout,
  margin: [0, 0, 0, 10],
});

const data = ({ header, rows }, widths, fontSize = 8) => ({
  table: {
    widths,
    headerRows: 1,
    dontBreakRows: true,
    body: [header.map((h) => ({ text: h, bold: true, fillColor: HEAD_FILL })), ...rows.map((r) => r.map((v) => String(v ?? '')))],
  },
  layout,
  fontSize,
  margin: [0, 0, 0, 10],
});

export function renderPdf(m) {
  const L = m.L;
  const content = [
    { text: m.title, style: 'title' },
    { text: m.subtitle, style: 'subtitle' },
    kv(m.meta),
  ];
  for (const g of m.general) content.push({ text: g.heading, style: 'h2' }, { text: g.text, margin: [0, 0, 0, 8] });

  for (const pt of m.points) {
    content.push({ text: pt.heading, style: 'h1', pageBreak: 'before' });
    content.push({ text: L.secA, style: 'h2' }, kv(pt.caseTable, [L.item, L.fill]));
    content.push({ text: L.summary, style: 'h3' }, data(pt.summary, [55, '*', 70, 75, 75, 45]));
    content.push({ text: L.secB, style: 'h2' });
    if (!pt.findings.length) content.push({ text: L.noFindings, margin: [0, 0, 0, 8] });
    for (const f of pt.findings) {
      content.push({ text: f.heading, style: 'h3' }, kv(f.table, [L.field, L.fill]));
      for (const im of f.images) {
        content.push({ image: im.dataUrl, fit: [480, 300], alignment: 'center' }, { text: im.caption, style: 'caption' });
      }
    }
    content.push({ text: L.secC, style: 'h2' });
    content.push(pt.plan.rows.length ? data(pt.plan, [35, '*', 40, 60, 50, 60, 60, 40], 7) : { text: L.noPlan, margin: [0, 0, 0, 8] });
    content.push({ text: L.secD, style: 'h2' }, { text: pt.interpretation, margin: [0, 0, 0, 8] });
  }

  const c = m.conclusion;
  content.push({ text: c.heading, style: 'h1', pageBreak: 'before' }, { text: c.text, margin: [0, 0, 0, 8] });
  content.push({ text: L.stats, style: 'h3' }, data(c.stats, ['*', 100], 9));
  content.push({ text: L.bySeverity, style: 'h3' }, data(c.severity, ['*', 100], 9));

  const ig = m.integrity;
  content.push({ text: ig.heading, style: 'h1', pageBreak: 'before' });
  content.push({ text: ig.text, bold: true, color: ig.valid ? '#1F7A4D' : '#B42318', margin: [0, 0, 0, 6] });
  if (ig.errors.length) content.push({ ul: ig.errors, margin: [0, 0, 0, 6] });
  if (ig.warnings.length) content.push({ ul: ig.warnings, color: '#6B5000', margin: [0, 0, 0, 6] });
  content.push({ text: ig.how, margin: [0, 0, 0, 6] }, { text: ig.contentHash, fontSize: 8, color: '#555555' });

  content.push({ text: m.log.heading, style: 'h1', pageBreak: 'before' }, data(m.log, [18, 75, '*', 68, 68, 60, 55], 6.5));
  content.push({ text: m.people.heading, style: 'h1' });
  content.push(data(m.people.auditors, ['*', 90, 120, 90], 8), data(m.people.devices, [60, '*', 70, 55, 50, 70], 7));

  const doc = {
    pageSize: 'LETTER',
    pageMargins: [50, 50, 50, 50],
    defaultStyle: { font: 'Roboto', fontSize: 9.5, lineHeight: 1.15 },
    info: { title: `${m.title} - ${m.subtitle}`, creator: 'Asistente de Auditoría' },
    footer: (page, pages) => ({ text: `${m.footer} · ${page}/${pages}`, alignment: 'center', fontSize: 7, color: '#777777', margin: [0, 15, 0, 0] }),
    styles: {
      title: { fontSize: 20, bold: true, color: '#1F3864', margin: [0, 0, 0, 4] },
      subtitle: { fontSize: 12, color: '#444444', margin: [0, 0, 0, 12] },
      h1: { fontSize: 15, bold: true, color: '#1F3864', margin: [0, 6, 0, 8] },
      h2: { fontSize: 12, bold: true, color: '#2457C5', margin: [0, 8, 0, 6] },
      h3: { fontSize: 10.5, bold: true, margin: [0, 6, 0, 4] },
      caption: { fontSize: 7.5, italics: true, color: '#555555', alignment: 'center', margin: [0, 2, 0, 10] },
    },
    content,
  };

  return new Promise((resolve, reject) => {
    const pdf = printer.createPdfKitDocument(doc);
    const chunks = [];
    pdf.on('data', (c) => chunks.push(c));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);
    pdf.end();
  });
}
