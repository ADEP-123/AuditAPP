// Casos de uso "guardar para continuar después" y "continuar desde archivo".
import { evidenceStore } from '../../infrastructure/storage/evidenceStore.js';
import { sha256Hex } from '../../infrastructure/crypto/hash.js';
import { downloadBlob, slug } from '../../infrastructure/files/download.js';
import { integrityApi } from '../../infrastructure/api/integrityApi.js';

export const FILE_FORMAT = 'audit-assistant-export';

const allImages = (audit) => audit.processes.flatMap((p) => p.items.flatMap((i) => i.images ?? []));

export async function collectImages(audit) {
  const images = {};
  for (const im of allImages(audit)) {
    const rec = await evidenceStore.get(im.id);
    if (rec) images[im.id] = rec.dataUrl;
  }
  return images;
}

export async function exportAuditFile(audit) {
  const images = await collectImages(audit);
  const file = { format: FILE_FORMAT, version: 1, exportedAt: new Date().toISOString(), audit, images };
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(new Blob([JSON.stringify(file)], { type: 'application/json' }), `auditoria-${slug(audit.general.company)}-${date}.audit.json`);
}

export function parseAuditFile(text) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    throw new Error('invalidJson');
  }
  if (file?.format !== FILE_FORMAT || !file.audit?.log || !Array.isArray(file.audit.processes)) throw new Error('invalidFormat');
  return { audit: file.audit, images: file.images ?? {} };
}

function dataUrlBytes(dataUrl) {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// Verificación completa de un archivo: bitácora (en el servidor) e imágenes (aquí, por su SHA-256).
export async function checkAuditFile({ audit, images }) {
  const log = await integrityApi.verify(audit);
  const imageIssues = [];
  for (const im of allImages(audit)) {
    const data = images[im.id];
    if (!data) imageIssues.push({ id: im.id, name: im.name, code: 'missing' });
    else if ((await sha256Hex(dataUrlBytes(data))) !== im.sha256) imageIssues.push({ id: im.id, name: im.name, code: 'altered' });
  }
  return { log, imageIssues, valid: log.valid && imageIssues.length === 0 };
}

export async function restoreImages(images) {
  await evidenceStore.clear();
  for (const [id, dataUrl] of Object.entries(images)) await evidenceStore.put({ id, dataUrl });
}
