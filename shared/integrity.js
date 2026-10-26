// Bitácora íntegra: cadena de hashes + sello de tiempo del servidor.
//
//  hash(evento n) = SHA-256(seq, tipo, hora cliente, auditor, dispositivo, datos, stateHash, hash(evento n-1))
//  stateHash      = SHA-256(contenido de la auditoría sin la bitácora) en el momento del evento
//  sello          = HMAC-SHA256(llave del servidor, hash | hora del servidor)
//
// Editar el JSON a mano rompe la cadena o deja el contenido distinto del último stateHash.
// Agregar eventos falsos exige pedir sellos al servidor, que solo da la hora actual: no se puede
// fechar hacia atrás.
import { canonicalJson } from './canonical.js';

export const GENESIS = '0'.repeat(64);
const HEX64 = /^[0-9a-f]{64}$/;

export function auditContent(audit) {
  const { log, ...content } = audit;
  return content;
}

export const contentString = (audit) => canonicalJson(auditContent(audit));

export const eventString = (e) =>
  canonicalJson({
    seq: e.seq,
    type: e.type,
    clientAt: e.clientAt,
    auditorId: e.auditorId,
    deviceId: e.deviceId,
    data: e.data,
    stateHash: e.stateHash,
    prevHash: e.prevHash,
  });

export const stampString = (hash, serverAt) => `${hash}|${serverAt}`;
export const isHash = (h) => typeof h === 'string' && HEX64.test(h);

/**
 * Verifica la bitácora completa. sha256(texto) y verifyStamp(hash, serverAt, stamp) se inyectan
 * (Web Crypto en el navegador, node:crypto en el servidor).
 * Devuelve { valid, errors: [{ seq, code }], warnings: [{ seq, code }], events, firstServerAt, lastServerAt }.
 */
export async function verifyAudit(audit, { sha256, verifyStamp, maxSkewMs = 5 * 60 * 1000 }) {
  const errors = [];
  const warnings = [];
  const log = Array.isArray(audit?.log) ? audit.log : [];
  if (!log.length) errors.push({ seq: 0, code: 'empty_log' });

  let prevHash = GENESIS;
  let prevServerAt = null;
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    const seq = i + 1;
    if (e.seq !== seq) errors.push({ seq, code: 'seq_gap' });
    if (e.prevHash !== prevHash) errors.push({ seq, code: 'prev_mismatch' });
    if (!isHash(e.hash) || (await sha256(eventString(e))) !== e.hash) errors.push({ seq, code: 'hash_mismatch' });

    if (!e.serverAt || !e.stamp) {
      warnings.push({ seq, code: 'unstamped' });
    } else {
      if (!verifyStamp(e.hash, e.serverAt, e.stamp)) errors.push({ seq, code: 'stamp_invalid' });
      if (prevServerAt && e.serverAt < prevServerAt) errors.push({ seq, code: 'time_reversed' });
      if (Math.abs(Date.parse(e.clientAt) - Date.parse(e.serverAt)) > maxSkewMs) warnings.push({ seq, code: 'clock_skew' });
      prevServerAt = e.serverAt;
    }
    prevHash = e.hash;
  }

  if (log.length && (await sha256(contentString(audit))) !== log.at(-1).stateHash) {
    errors.push({ seq: log.length, code: 'content_modified' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    events: log.length,
    firstServerAt: log.find((e) => e.serverAt)?.serverAt ?? null,
    lastServerAt: log.findLast((e) => e.serverAt)?.serverAt ?? null,
  };
}
