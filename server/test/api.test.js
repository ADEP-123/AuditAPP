import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createApp } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createApp({ key: crypto.randomBytes(32) }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('salud y cabeceras de seguridad', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('catálogos: lista y detalle', async () => {
  const list = await (await fetch(`${base}/frameworks`)).json();
  assert.deepEqual(list.map((f) => f.id).sort(), ['asvs-5.0', 'iso27001-2022', 'owasp-top10-2025']);
  assert.equal(list.find((f) => f.id === 'asvs-5.0').itemCount, 345);
  const iso = await (await fetch(`${base}/frameworks/iso27001-2022`)).json();
  assert.equal(iso.items.length, 93);
  assert.equal((await fetch(`${base}/frameworks/..%2F..%2Fetc%2Fpasswd`)).status, 404);
});

test('sello de tiempo: válido solo para hashes SHA-256', async () => {
  const ok = await post('/integrity/stamp', { hash: 'a'.repeat(64) });
  assert.equal(ok.status, 200);
  const body = await ok.json();
  assert.match(body.stamp, /^[0-9a-f]{64}$/);
  assert.ok(Math.abs(Date.parse(body.serverAt) - Date.now()) < 5000);
  assert.equal((await post('/integrity/stamp', { hash: 'x' })).status, 400);
});

test('entradas inválidas devuelven 400 sin filtrar detalles internos', async () => {
  const res = await post('/integrity/verify', { audit: 'nada' });
  assert.equal(res.status, 400);
  assert.equal((await post('/reports/exe', { audit: {} })).status, 400);
  const bad = await fetch(`${base}/integrity/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{malformado' });
  assert.equal(bad.status, 400);
  assert.deepEqual(await bad.json(), { error: 'Invalid JSON' });
});

test('rutas inexistentes de la API responden 404 en JSON', async () => {
  const res = await fetch(`${base}/no-existe`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Not found' });
});
