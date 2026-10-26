import { buildReportModel } from '../reports/buildReportModel.js';
import { AppError } from '../errors.js';

const TYPES = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
};

function slug(text) {
  return String(text || 'auditoria').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function assertAudit(audit) {
  const ok = audit && typeof audit === 'object' && audit.general && Array.isArray(audit.processes)
    && Array.isArray(audit.log) && Array.isArray(audit.auditors) && Array.isArray(audit.devices);
  if (!ok) throw new AppError(400, 'invalid audit');
}

// Informe = integridad verificada + modelo traducido + renderizador del formato pedido.
export function createReportService({ integrityService, renderers }) {
  return {
    async generate({ format, audit, images, lang }) {
      if (!renderers[format]) throw new AppError(400, `unsupported format: ${format}`);
      assertAudit(audit);
      const integrity = await integrityService.verify(audit);
      const model = buildReportModel({
        audit,
        images: images ?? {},
        lang: lang === 'en' ? 'en' : 'es',
        integrity,
        contentHash: await integrityService.contentHash(audit),
      });
      const buffer = await renderers[format](model);
      const date = new Date().toISOString().slice(0, 10);
      return { buffer, contentType: TYPES[format], filename: `informe-auditoria-${slug(audit.general.company)}-${date}.${format}` };
    },
  };
}
