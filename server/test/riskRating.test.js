import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FACTOR_GROUPS, levelOf, rateRisk, severityOf } from '../../shared/riskRating.js';

const pick = (values) => {
  // values: { factorId: valorNumérico } -> índice de la primera opción con ese valor
  const sel = {};
  for (const g of FACTOR_GROUPS) for (const f of g.factors) {
    if (f.id in values) sel[f.id] = f.options.findIndex((o) => o.value === values[f.id]);
  }
  return sel;
};

test('niveles según la escala 0-9 de OWASP', () => {
  assert.equal(levelOf(0), 'low');
  assert.equal(levelOf(2.99), 'low');
  assert.equal(levelOf(3), 'medium');
  assert.equal(levelOf(5.99), 'medium');
  assert.equal(levelOf(6), 'high');
});

test('matriz de severidad (Tabla 1 del proyecto)', () => {
  assert.equal(severityOf('low', 'low'), 'note');
  assert.equal(severityOf('high', 'low'), 'medium');
  assert.equal(severityOf('medium', 'medium'), 'medium');
  assert.equal(severityOf('medium', 'high'), 'high');
  assert.equal(severityOf('high', 'high'), 'critical');
});

test('probabilidad media e impacto técnico alto dan severidad alta', () => {
  // probabilidad: (5+1+7+2+3+5+9+1)/8 = 4.125 -> media; impacto técnico: (9+7+5+9)/4 = 7.5 -> alto
  const r = rateRisk(pick({ skill: 5, motive: 1, opportunity: 7, size: 2, discovery: 3, exploit: 5, awareness: 9, detection: 1,
    confidentiality: 9, integrity: 7, availability: 5, accountability: 9 }));
  assert.equal(r.likelihood.score, 4.13);
  assert.equal(r.impact.score, 7.5);
  assert.equal(r.likelihood.level, 'medium');
  assert.equal(r.impact.level, 'high');
  assert.equal(r.impact.basis, 'technical');
  assert.equal(r.severity, 'high');
});

test('el impacto de negocio tiene prioridad sobre el técnico', () => {
  const r = rateRisk(pick({ skill: 9, motive: 9, opportunity: 9, size: 9, confidentiality: 9, financial: 1, reputation: 1 }));
  assert.equal(r.impact.basis, 'business');
  assert.equal(r.impact.level, 'low');
  assert.equal(r.severity, 'medium');
});

test('sin datos suficientes devuelve null', () => {
  assert.equal(rateRisk({}), null);
  assert.equal(rateRisk(pick({ skill: 9 })), null);
});
