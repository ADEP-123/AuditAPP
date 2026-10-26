import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { findProcess, processProgress } from '../../domain/audit.js';
import { loc } from '../../domain/localize.js';
import { PageHeader, ProgressBar, SeverityBadge, StatusBadge, formatDuration } from '../components/ui.jsx';
import { rateRisk } from '../../../../shared/riskRating.js';

export default function ChecklistPage({ processId }) {
  const { t, lang } = useI18n();
  const { audit } = useAudit();
  const { go } = useNav();
  const process = findProcess(audit, processId);
  const prog = processProgress(process);

  // agrupado por marco normativo, en el orden en que se eligieron
  const byFramework = new Map();
  for (const it of process.items) {
    const name = loc(it.framework.name, lang);
    if (!byFramework.has(name)) byFramework.set(name, []);
    byFramework.get(name).push(it);
  }

  return (
    <>
      <PageHeader
        title={process.title}
        subtitle={t('checklist.subtitle', { done: prog.done, total: prog.total })}
        actions={
          <>
            <button type="button" className="btn ghost" onClick={() => go('dashboard')}>{t('common.back')}</button>
            <button type="button" className="btn ghost" onClick={() => go('criteria', { processId })}>{t('dashboard.criteria')}</button>
            <button type="button" className="btn ghost" onClick={() => go('plan', { processId })}>{t('dashboard.plan')}</button>
          </>
        }
      />
      <ProgressBar pct={prog.pct} />
      {[...byFramework.entries()].map(([name, items]) => (
        <section key={name} className="card">
          <h2>{name}</h2>
          <table className="table">
            <thead>
              <tr>
                <th>{t('checklist.id')}</th>
                <th>{t('checklist.item')}</th>
                <th>{t('checklist.status')}</th>
                <th>{t('checklist.time')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.key} className="clickable" onClick={() => go('item', { processId, itemKey: it.key })}>
                  <td><button type="button" className="link">{it.itemId}</button></td>
                  <td>
                    {loc(it.title, lang) !== it.itemId ? loc(it.title, lang) : ''}
                    {it.text && <span className="block small muted clamp">{loc(it.text, lang)}</span>}
                  </td>
                  <td>
                    <StatusBadge status={it.status} />
                    {it.finding && <span className="block"><SeverityBadge severity={rateRisk(it.finding.risk)?.severity} /></span>}
                  </td>
                  <td className="small">{it.timeSpentMs ? formatDuration(it.timeSpentMs) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </>
  );
}
