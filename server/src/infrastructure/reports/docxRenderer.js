import {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, Packer, PageNumber,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';

const FONT = 'Arial';
const PAGE_W = 9360; // carta con márgenes de 1": 6,5" en DXA
const HEAD_FILL = 'D9E2F3';
const border = { style: BorderStyle.SINGLE, size: 4, color: '9AA3B2' };
const borders = { top: border, bottom: border, left: border, right: border };

// Texto con saltos de línea -> runs con break
function runs(text, opts = {}) {
  return String(text ?? '').split('\n').map((line, i) => new TextRun({ text: line, break: i ? 1 : 0, font: FONT, ...opts }));
}
const p = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run), spacing: { after: 120 }, ...opts.para });
// keepNext: un título nunca queda solo al final de una página
const heading = (text, level) => new Paragraph({ heading: level, keepNext: true, children: [new TextRun({ text, font: FONT })], spacing: { before: 240, after: 120 } });

function cell(text, width, { header = false, shade = false, size = 18 } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: header || shade ? { fill: HEAD_FILL, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({ children: runs(text, { size, bold: header || shade }) })],
  });
}

function kvTable(rows, header) {
  const widths = [2700, PAGE_W - 2700];
  const body = rows.map(([k, v]) => new TableRow({ children: [cell(k, widths[0], { shade: true }), cell(v, widths[1])] }));
  const head = header ? [new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, widths[i], { header: true })) })] : [];
  return new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: widths, rows: [...head, ...body] });
}

function dataTable({ header, rows }, widths, size = 16) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, widths[i], { header: true, size })) }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((v, i) => cell(v, widths[i], { size })) })),
    ],
  });
}

function image({ dataUrl, width, height, caption }) {
  const data = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  const w = Math.min(600, width || 600);
  const h = Math.round(w * ((height || 400) / (width || 600)));
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'jpg', data, transformation: { width: w, height: h } })] }),
    p(caption, { run: { size: 16, italics: true, color: '555555' }, para: { alignment: AlignmentType.CENTER } }),
  ];
}

const space = () => new Paragraph({ children: [], spacing: { after: 120 } });

export async function renderDocx(m) {
  const L = m.L;
  const children = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: m.title, font: FONT })] }),
    p(m.subtitle, { run: { size: 26, color: '444444' } }),
    kvTable(m.meta),
  ];

  for (const g of m.general) children.push(heading(g.heading, HeadingLevel.HEADING_2), p(g.text));

  for (const pt of m.points) {
    children.push(heading(pt.heading, HeadingLevel.HEADING_1));
    children.push(heading(L.secA, HeadingLevel.HEADING_2), kvTable(pt.caseTable, [L.item, L.fill]), space());
    children.push(heading(L.summary, HeadingLevel.HEADING_3), dataTable(pt.summary, [1000, 3460, 1400, 1200, 1200, 1100]));

    children.push(heading(L.secB, HeadingLevel.HEADING_2));
    if (!pt.findings.length) children.push(p(L.noFindings));
    for (const f of pt.findings) {
      children.push(heading(f.heading, HeadingLevel.HEADING_3), kvTable(f.table, [L.field, L.fill]));
      for (const im of f.images) children.push(...image(im));
      children.push(space());
    }

    children.push(heading(L.secC, HeadingLevel.HEADING_2));
    children.push(pt.plan.rows.length ? dataTable(pt.plan, [900, 1900, 900, 1200, 1100, 1200, 1200, 960]) : p(L.noPlan));
    children.push(heading(L.secD, HeadingLevel.HEADING_2), p(pt.interpretation));
  }

  const c = m.conclusion;
  children.push(heading(c.heading, HeadingLevel.HEADING_1), p(c.text));
  children.push(heading(L.stats, HeadingLevel.HEADING_3), dataTable(c.stats, [6000, 3360], 18));
  children.push(heading(L.bySeverity, HeadingLevel.HEADING_3), dataTable(c.severity, [6000, 3360], 18));

  const ig = m.integrity;
  children.push(heading(ig.heading, HeadingLevel.HEADING_1));
  children.push(p(ig.text, { run: { bold: true, color: ig.valid ? '1F7A4D' : 'B42318' } }));
  for (const e of ig.errors) children.push(p(`• ${e}`));
  for (const w of ig.warnings) children.push(p(`• ${w}`, { run: { color: '6B5000' } }));
  children.push(p(ig.how), p(ig.contentHash, { run: { size: 16, font: 'Consolas' } }));

  children.push(heading(m.log.heading, HeadingLevel.HEADING_1), dataTable(m.log, [450, 1700, 1850, 1500, 1500, 1300, 1060], 14));

  children.push(heading(m.people.heading, HeadingLevel.HEADING_1));
  children.push(dataTable(m.people.auditors, [2800, 2000, 2560, 2000], 16), space());
  children.push(dataTable(m.people.devices, [1500, 3000, 1400, 1200, 960, 1300], 14));

  const doc = new Document({
    creator: 'Asistente de Auditoría',
    title: `${m.title} - ${m.subtitle}`,
    styles: {
      default: { document: { run: { font: FONT, size: 20 } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 44, bold: true, color: '1F3864', font: FONT }, paragraph: { spacing: { after: 120 } } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, color: '1F3864', font: FONT }, paragraph: { outlineLevel: 0, spacing: { before: 360, after: 160 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '2457C5', font: FONT }, paragraph: { outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 21, bold: true, font: FONT }, paragraph: { outlineLevel: 2 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `${m.footer} · `, size: 14, font: FONT, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], size: 14, font: FONT, color: '777777' })],
          })],
        }),
      },
      children,
    }],
  });
  return Packer.toBuffer(doc);
}
