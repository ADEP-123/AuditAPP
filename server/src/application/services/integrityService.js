import crypto from 'node:crypto';
import { isHash, stampString, verifyAudit } from '../../../../shared/integrity.js';
import { AppError } from '../errors.js';

const sha256 = async (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

export function createIntegrityService(key) {
  const hmac = (hash, serverAt) => crypto.createHmac('sha256', key).update(stampString(hash, serverAt)).digest('hex');

  const verifyStamp = (hash, serverAt, stamp) => {
    if (typeof stamp !== 'string' || !/^[0-9a-f]{64}$/.test(stamp)) return false;
    return crypto.timingSafeEqual(Buffer.from(hmac(hash, serverAt), 'hex'), Buffer.from(stamp, 'hex'));
  };

  return {
    // Sella un hash de evento con la hora actual del servidor.
    stamp(hash) {
      if (!isHash(hash)) throw new AppError(400, 'hash must be a SHA-256 hex string');
      const serverAt = new Date().toISOString();
      return { serverAt, stamp: hmac(hash, serverAt) };
    },

    verify(audit) {
      if (!audit || typeof audit !== 'object' || !Array.isArray(audit.log)) throw new AppError(400, 'audit with log is required');
      return verifyAudit(audit, { sha256, verifyStamp });
    },
  };
}
