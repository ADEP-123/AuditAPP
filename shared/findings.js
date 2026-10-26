import { rateRisk } from './riskRating.js';

export const NEEDS_FINDING = ['partial', 'non_compliant'];

// Hallazgos de toda la auditoría, numerados H-01, H-02… en el orden de procesos y puntos.
// Una sola función para la pantalla y el informe: la numeración siempre coincide.
export function listFindings(audit) {
  const out = [];
  for (const process of audit.processes) {
    for (const item of process.items) {
      if (!NEEDS_FINDING.includes(item.status) || !item.finding) continue;
      out.push({
        code: `H-${String(out.length + 1).padStart(2, '0')}`,
        process,
        item,
        finding: item.finding,
        rating: rateRisk(item.finding.risk),
      });
    }
  }
  return out;
}

export const PRIORITY_BY_SEVERITY = { critical: 'high', high: 'high', medium: 'medium', low: 'low', note: 'low' };

export const isFindingComplete = (f) => Boolean(f?.title?.trim() && f?.condition?.trim());
