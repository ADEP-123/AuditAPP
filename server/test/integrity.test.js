import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createIntegrityService } from '../src/application/services/integrityService.js';
import { GENESIS, contentString, eventString } from '../../shared/integrity.js';
import { canonicalJson } from '../../shared/canonical.js';

const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const service = createIntegrityService(crypto.randomBytes(32));

// Construye una auditoría con bitácora válida, como lo hace el cliente.
function buildAudit(steps) {
  const audit = { id: 'a1', general: { title: 'Prueba' }, processes: [], log: [] };
  for (const [type, mutate] of steps) {
    mutate(audit);
    const prev = audit.log.at(-1);
    const e = {
      seq: audit.log.length + 1, type, clientAt: new Date().toISOString(), auditorId: 'u1', deviceId: 'd1',
      data: {}, stateHash: sha(contentString(audit)), prevHash: prev ? prev.hash : GENESIS,
    };
    e.hash = sha(eventString(e));
    Object.assign(e, service.stamp(e.hash));
    audit.log.push(e);
  }
  return audit;
}

const sample = () => buildAudit([
  ['audit.created', () => {}],
  ['process.created', (a) => a.processes.push({ id: 'p1', title: 'Accesos', items: [] })],
  ['item.saved', (a) => a.processes[0].items.push({ key: 'k1', status: 'non_compliant' })],
]);

test('JSON canónico ignora el orden de las claves', () => {
  assert.equal(canonicalJson({ b: 1, a: [2, { d: 1, c: 2 }] }), canonicalJson({ a: [2, { c: 2, d: 1 }], b: 1 }));
});

test('una bitácora íntegra se verifica', async () => {
  const r = await service.verify(sample());
  assert.equal(r.valid, true, JSON.stringify(r.errors));
  assert.equal(r.events, 3);
});

test('editar el contenido a mano se detecta', async () => {
  const a = sample();
  a.processes[0].items[0].status = 'compliant';
  const r = await service.verify(a);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.code === 'content_modified'));
});

test('editar un evento rompe su hash', async () => {
  const a = sample();
  a.log[1].type = 'otro';
  const r = await service.verify(a);
  assert.ok(r.errors.some((e) => e.seq === 2 && e.code === 'hash_mismatch'));
});

test('cambiar la hora del servidor invalida el sello', async () => {
  const a = sample();
  a.log[0].serverAt = '2020-01-01T00:00:00.000Z';
  const r = await service.verify(a);
  assert.ok(r.errors.some((e) => e.seq === 1 && e.code === 'stamp_invalid'));
});

test('borrar un evento rompe la cadena', async () => {
  const a = sample();
  a.log.splice(1, 1);
  const r = await service.verify(a);
  assert.ok(r.errors.some((e) => e.code === 'seq_gap' || e.code === 'prev_mismatch'));
});

test('un sello de otra llave no es válido', async () => {
  const other = createIntegrityService(crypto.randomBytes(32));
  const a = sample();
  Object.assign(a.log[2], other.stamp(a.log[2].hash));
  const r = await service.verify(a);
  assert.ok(r.errors.some((e) => e.seq === 3 && e.code === 'stamp_invalid'));
});

test('el sello rechaza valores que no son hashes', () => {
  assert.throws(() => service.stamp('no-es-hash'), /SHA-256/);
});
