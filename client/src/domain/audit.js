// Modelo de dominio de una auditoría. Funciones puras: sin React ni almacenamiento.

export const SCHEMA = 'audit-assistant/v1';

export const STATUS = {
  PENDING: 'pending',
  COMPLIANT: 'compliant',
  PARTIAL: 'partial',
  NON_COMPLIANT: 'non_compliant',
  NOT_APPLICABLE: 'not_applicable',
};
export const AUDITED_STATUSES = [STATUS.COMPLIANT, STATUS.PARTIAL, STATUS.NON_COMPLIANT, STATUS.NOT_APPLICABLE];
export const needsFinding = (status) => status === STATUS.PARTIAL || status === STATUS.NON_COMPLIANT;

export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function createAudit({ general, auditor, device, serverTime }) {
  const now = serverTime || new Date().toISOString();
  const auditorId = uid();
  return {
    schema: SCHEMA,
    id: uid(),
    createdAt: now,
    status: 'in_progress',
    general: { ...general, startedAt: now },
    auditors: [{ ...auditor, id: auditorId, addedAt: now }],
    devices: [{ ...device, firstSeenAt: now }],
    currentAuditorId: auditorId,
    currentDeviceId: device.id,
    processes: [],
    conclusion: '',
    log: [],
  };
}

export function createProcess(fields) {
  return { id: uid(), items: [], actionPlan: [], interpretation: '', ...fields };
}

export function itemFromCatalog(fw, item, groupName) {
  return {
    key: `${fw.id}:${item.id}`,
    custom: false,
    frameworkId: fw.id,
    framework: { name: fw.name, version: fw.version },
    itemId: item.id,
    group: { id: item.group, name: groupName },
    level: item.level ?? null,
    section: item.section ?? null,
    title: item.title,
    text: item.text ?? null,
    guidanceKey: item.guidanceKey ?? item.group,
    ...emptyResult(),
  };
}

export function customItem({ code, title, text, guidance }) {
  return {
    key: `custom:${uid()}`,
    custom: true,
    frameworkId: null,
    framework: { name: { es: 'Punto agregado por el auditor', en: 'Auditor-defined item' }, version: '' },
    itemId: code || '—',
    group: { id: 'custom', name: { es: 'Personalizado', en: 'Custom' } },
    level: null,
    title: { es: title, en: title },
    text: text ? { es: text, en: text } : null,
    guidance: guidance || '',
    ...emptyResult(),
  };
}

function emptyResult() {
  return { status: STATUS.PENDING, notes: '', evidence: [], startedAt: null, lastSavedAt: null, timeSpentMs: 0 };
}

export function processProgress(process) {
  const total = process.items.length;
  const done = process.items.filter((i) => i.status !== STATUS.PENDING).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function findProcess(audit, processId) {
  return audit?.processes.find((p) => p.id === processId) ?? null;
}
