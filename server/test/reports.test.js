import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createIntegrityService } from '../src/application/services/integrityService.js';
import { createReportService } from '../src/application/services/reportService.js';
import { renderDocx } from '../src/infrastructure/reports/docxRenderer.js';
import { renderPdf } from '../src/infrastructure/reports/pdfRenderer.js';
import { GENESIS, contentString, eventString } from '../../shared/integrity.js';

const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const integrityService = createIntegrityService(crypto.randomBytes(32));
const reports = createReportService({ integrityService, renderers: { docx: renderDocx, pdf: renderPdf } });

// 1x1 px JPEG
const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=';

function sampleAudit() {
  const audit = {
    id: 'a1', createdAt: '2026-10-26T15:00:00.000Z', status: 'in_progress', conclusion: 'Conclusión de prueba.',
    general: { title: 'Auditoría de prueba', company: 'Empresa Ñandú S.A.S.', context: 'Contexto', reason: 'Razón', scope: '' },
    auditors: [{ id: 'u1', name: 'Andrés', role: 'Auditor', addedAt: '2026-10-26T15:00:00.000Z' }],
    devices: [{ id: 'd1', info: { userAgent: 'UA', timeZone: 'America/Bogota', screen: '1280x900@1' }, firstSeenAt: '2026-10-26T15:00:00.000Z' }],
    currentAuditorId: 'u1', currentDeviceId: 'd1',
    processes: [{
      id: 'p1', title: 'Accesos', system: 'Juice Shop', asset: '', context: 'c', reason: 'r', scope: '', interpretation: 'Urgente.',
      items: [{
        key: 'asvs-5.0:V6.1.1', itemId: 'V6.1.1', custom: false, framework: { name: { es: 'OWASP ASVS 5.0', en: 'OWASP ASVS 5.0' } },
        group: { id: 'V6', name: { es: 'Autenticación' } }, title: { en: 'V6.1.1' }, text: { en: 'Verify that…' }, section: { en: 'Docs' },
        status: 'non_compliant', notes: 'Sin bloqueo', evidence: [{ id: 'e1', description: 'Captura → 200 OK' }],
        images: [{ id: 'i1', name: 'cap.jpg', width: 1, height: 1, sha256: 'x', caption: 'Respuesta' }],
        startedAt: '2026-10-26T15:01:00.000Z', lastSavedAt: '2026-10-26T15:05:00.000Z', timeSpentMs: 240000,
        finding: { title: 'Sin límite de intentos', criterion: 'ASVS V6.1.1', condition: '50 intentos', cause: 'c', effect: 'e', recommendation: 'Limitar', risk: { skill: 3, confidentiality: 3 } },
      }],
      actionPlan: [{ id: 'x', findingKey: 'asvs-5.0:V6.1.1', action: 'Limitar', priority: 'high', owner: 'TI', dueDate: '2026-11-30', implementationEvidence: '', effectivenessEvidence: '', state: 'open' }],
    }],
    log: [],
  };
  for (const type of ['audit.created', 'item.saved']) {
    const prev = audit.log.at(-1);
    const e = { seq: audit.log.length + 1, type, clientAt: new Date().toISOString(), auditorId: 'u1', deviceId: 'd1', data: { key: 'asvs-5.0:V6.1.1', status: 'non_compliant' }, stateHash: sha(contentString(audit)), prevHash: prev ? prev.hash : GENESIS };
    e.hash = sha(eventString(e));
    audit.log.push(Object.assign(e, integrityService.stamp(e.hash)));
  }
  return audit;
}

for (const format of ['docx', 'pdf']) {
  for (const lang of ['es', 'en']) {
    test(`genera informe ${format} en ${lang}`, async () => {
      const r = await reports.generate({ format, lang, audit: sampleAudit(), images: { i1: JPEG } });
      assert.ok(r.buffer.length > 3000);
      assert.equal(r.buffer.subarray(0, 4).toString('latin1'), format === 'pdf' ? '%PDF' : 'PK\u0003\u0004');
      assert.match(r.filename, new RegExp(`^informe-auditoria-empresa-nandu-s-a-s-\\d{4}-\\d{2}-\\d{2}\\.${format}$`));
    });
  }
}

test('rechaza formatos no soportados y auditorías inválidas', async () => {
  await assert.rejects(reports.generate({ format: 'xls', audit: sampleAudit() }), /unsupported/);
  await assert.rejects(reports.generate({ format: 'pdf', audit: { foo: 1 } }), /invalid audit/);
});
