// Convierte una auditoría en un modelo de informe neutro (textos ya traducidos),
// que luego dibujan los renderizadores de Word y PDF.
import { listFindings } from '../../../../shared/findings.js';
import { SEVERITY_LABEL, SEVERITY_ORDER } from '../../../../shared/riskRating.js';
import { loc } from '../../../../shared/localize.js';
import { LABELS } from './labels.js';

const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

function makeDate(lang, timeZone) {
  const f = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { dateStyle: 'medium', timeStyle: 'medium', timeZone });
  return (iso) => (iso ? `${f.format(new Date(iso))}` : '—');
}

function safeTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return tz || 'UTC';
  } catch {
    return 'UTC';
  }
}

function duration(ms) {
  const m = Math.round((ms || 0) / 60000);
  if (!ms) return '—';
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function buildReportModel({ audit, images = {}, lang = 'es', integrity, contentHash }) {
  const L = LABELS[lang] ?? LABELS.es;
  // las fechas se muestran en la zona horaria del equipo con el que se inició la auditoría
  const timeZone = safeTimeZone(audit.devices[0]?.info?.timeZone);
  const date = makeDate(lang, timeZone);
  const text = (v) => (v && String(v).trim() ? String(v) : L.noText);
  const auditorName = new Map(audit.auditors.map((a) => [a.id, a.name]));
  const findings = listFindings(audit);
  const lastServerAt = audit.log.findLast((e) => e.serverAt)?.serverAt;

  const meta = [
    [L.company, audit.general.company],
    [L.auditTitle, audit.general.title],
    [L.auditors, audit.auditors.map((a) => [a.name, a.role].filter(Boolean).join(' – ')).join('; ')],
    [L.start, date(audit.createdAt)],
    [L.end, date(lastServerAt)],
  ];
  if (audit.general.place) meta.push([L.place, audit.general.place]);
  if (audit.general.coords) meta.push([L.coords, `${audit.general.coords.lat}, ${audit.general.coords.lon} (±${audit.general.coords.accuracyM} m)`]);
  meta.push([L.generatedAt, date(new Date().toISOString())]);
  meta.push([L.timeZone, timeZone]);

  const points = audit.processes.map((p, idx) => {
    const frameworks = [...new Set(p.items.map((i) => loc(i.framework.name, lang)))];
    const evidence = p.items.flatMap((i) => [
      ...i.evidence.map((e) => e.description).filter(Boolean).map((d) => `${i.itemId}: ${d}`),
      ...(i.images ?? []).map((im) => `${i.itemId}: ${im.caption || im.name} (${L.image})`),
    ]);
    const pointFindings = findings.filter((f) => f.process.id === p.id);
    const codeByKey = new Map(pointFindings.map((f) => [f.item.key, f.code]));

    return {
      heading: fmt(L.point, { n: idx + 1, title: p.title }),
      caseTable: [
        [L.organization, audit.general.company],
        [L.system, text(p.system)],
        [L.process, text(p.title)],
        [L.asset, text(p.asset)],
        [L.objective, text(p.reason)],
        [L.processContext, text(p.context)],
        [L.processScope, text(p.scope)],
        [L.criteria, `${frameworks.join('; ')}: ${p.items.map((i) => i.itemId).join(', ')}`],
        [L.evidence, evidence.length ? evidence.join('\n') : L.noText],
      ],
      summary: {
        header: [L.id, L.requirement, L.result, L.startedAt, L.savedAt, L.time],
        rows: p.items.map((i) => [
          i.itemId,
          loc(i.title, lang) !== i.itemId ? loc(i.title, lang) : loc(i.text, lang) || loc(i.section, lang),
          L.status[i.status],
          date(i.startedAt),
          date(i.lastSavedAt),
          duration(i.timeSpentMs),
        ]),
      },
      findings: pointFindings.map(({ code, item, finding, rating }) => ({
        heading: fmt(L.finding, { code }),
        table: [
          [L.findingId, code],
          [L.findingTitle, text(finding.title)],
          [L.criterion, text(finding.criterion)],
          [L.condition, text(finding.condition)],
          [L.cause, text(finding.cause)],
          [L.effect, text(finding.effect)],
          [L.risk, rating
            ? fmt(L.riskDetail, {
              severity: loc(SEVERITY_LABEL[rating.severity], lang),
              ls: rating.likelihood.score, ll: L.level[rating.likelihood.level],
              is: rating.impact.score, il: L.level[rating.impact.level], basis: L.basis[rating.impact.basis],
            })
            : L.riskMissing],
          [L.recommendation, text(finding.recommendation)],
          [L.support, [...item.evidence.map((e) => e.description).filter(Boolean), ...(item.images ?? []).map((im) => im.caption || im.name)].join('\n') || L.noText],
          [L.notes, text(item.notes)],
        ],
        images: (item.images ?? [])
          .filter((im) => images[im.id])
          .map((im) => ({ dataUrl: images[im.id], width: im.width, height: im.height, caption: `${L.image}: ${im.caption || im.name} · ${L.sha} ${im.sha256}` })),
      })),
      plan: {
        header: L.planHeader,
        rows: p.actionPlan
          .filter((a) => codeByKey.has(a.findingKey))
          .map((a) => [codeByKey.get(a.findingKey), text(a.action), L.priority[a.priority], text(a.owner), a.dueDate || '—', text(a.implementationEvidence), text(a.effectivenessEvidence), L.state[a.state]]),
      },
      interpretation: text(p.interpretation),
    };
  });

  const items = audit.processes.flatMap((p) => p.items);
  const count = (s) => items.filter((i) => i.status === s).length;
  const applicable = items.length - count('not_applicable') - count('pending');
  const compliance = applicable ? Math.round(((count('compliant') + 0.5 * count('partial')) / applicable) * 100) : null;

  return {
    lang,
    L,
    title: L.reportTitle,
    subtitle: `${audit.general.title} · ${audit.general.company}`,
    meta,
    general: [
      { heading: L.context, text: text(audit.general.context) },
      { heading: L.reason, text: text(audit.general.reason) },
      { heading: L.scope, text: text(audit.general.scope) },
    ],
    points,
    conclusion: {
      heading: L.general,
      text: text(audit.conclusion),
      stats: {
        header: L.statsHeader,
        rows: [
          [L.statPoints, String(audit.processes.length)],
          [L.statItems, String(items.length)],
          [L.statAudited, `${items.length - count('pending')} / ${items.length}`],
          ...Object.keys(L.status).filter((s) => s !== 'pending').map((s) => [L.status[s], String(count(s))]),
          [L.statCompliance, compliance === null ? '—' : `${compliance} %`],
          [L.statFindings, String(findings.length)],
        ],
      },
      severity: {
        header: L.severityHeader,
        rows: [...SEVERITY_ORDER].reverse().map((s) => [loc(SEVERITY_LABEL[s], lang), String(findings.filter((f) => f.rating?.severity === s).length)]),
      },
    },
    integrity: {
      heading: L.annexIntegrity,
      valid: integrity.valid,
      text: integrity.valid ? fmt(L.integrityOk, { n: integrity.events }) : L.integrityBad,
      errors: integrity.errors.map((e) => `#${e.seq}: ${L.codes[e.code] ?? e.code}`),
      warnings: integrity.warnings.map((w) => `#${w.seq}: ${L.codes[w.code] ?? w.code}`),
      how: L.integrityHow,
      contentHash: `${L.contentHash}: ${contentHash}`,
    },
    log: {
      heading: L.annexLog,
      header: L.logHeader,
      rows: audit.log.map((e) => [
        String(e.seq),
        L.events[e.type] ?? e.type,
        describeEvent(e, audit, L),
        date(e.serverAt),
        date(e.clientAt),
        auditorName.get(e.auditorId) ?? '—',
        e.deviceId ?? '—',
      ]),
    },
    people: {
      heading: L.annexPeople,
      auditors: { header: L.auditorsHeader, rows: audit.auditors.map((a) => [a.name, a.role || '—', a.email || '—', date(a.addedAt)]) },
      devices: {
        header: L.devicesHeader,
        rows: audit.devices.map((d) => [
          d.id,
          d.info.browser || d.info.userAgent,
          d.info.timeZone,
          d.info.screen,
          d.ip || '—',
          date(d.firstSeenAt),
        ]),
      },
    },
    footer: fmt(L.footer, { date: date(new Date().toISOString()) }),
  };
}

function describeEvent(e, audit, L) {
  const d = e.data ?? {};
  const itemId = d.key ? audit.processes.flatMap((p) => p.items).find((i) => i.key === d.key)?.itemId ?? d.key : null;
  // sin flechas: la fuente del PDF no las incluye
  if (e.type === 'item.saved') return `${itemId}: ${L.status[d.status] ?? d.status}`;
  if (e.type === 'item.opened') return itemId ?? '';
  if (d.title) return d.title;
  if (e.type === 'criteria.updated') return `+${d.added?.length ?? 0} / −${d.removed?.length ?? 0}`;
  if (e.type === 'auditor.changed') return d.name ?? '';
  if (e.type === 'device.changed') return `${d.from} » ${d.to}`;
  if (e.type === 'session.resumed') return d.fileName ?? d.source ?? '';
  if (e.type === 'report.generated') return d.format ?? '';
  return '';
}
