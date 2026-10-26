import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { processProgress } from '../../domain/audit.js';
import { PageHeader, ProgressBar, formatDate } from '../components/ui.jsx';
import IntegrityPanel from '../components/IntegrityPanel.jsx';

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { audit, dispatch, logEvent } = useAudit();
  const { go } = useNav();
  const auditor = audit.auditors.find((a) => a.id === audit.currentAuditorId);

  const remove = (p) => {
    if (!window.confirm(t('dashboard.confirmRemove', { title: p.title }))) return;
    dispatch({ type: 'removeProcess', id: p.id });
    logEvent('process.removed', { processId: p.id, title: p.title });
  };

  return (
    <>
      <PageHeader
        title={audit.general.title}
        subtitle={`${audit.general.company} · ${t('home.startedAt')} ${formatDate(audit.createdAt, lang)} · ${auditor?.name ?? ''}`}
        actions={<button type="button" className="btn ghost" onClick={() => go('general', { mode: 'edit' })}>{t('dashboard.editGeneral')}</button>}
      />

      <section className="card">
        <div className="row between">
          <h2>{t('dashboard.processes')}</h2>
          <button type="button" className="btn" onClick={() => go('process', {})}>+ {t('dashboard.addProcess')}</button>
        </div>
        {audit.processes.length === 0 && <p className="muted">{t('dashboard.empty')}</p>}
        {audit.processes.map((p, idx) => {
          const prog = processProgress(p);
          return (
            <article key={p.id} className="tile process">
              <div className="row between">
                <div>
                  <h3>{t('dashboard.point', { n: idx + 1 })}: {p.title}</h3>
                  <p className="muted small">{p.system}</p>
                </div>
                <span className="small">{t('dashboard.progress', { done: prog.done, total: prog.total })}</span>
              </div>
              <ProgressBar pct={prog.pct} />
              <div className="row">
                <button type="button" className="btn small" disabled={!p.items.length} onClick={() => go('checklist', { processId: p.id })}>{t('dashboard.audit')}</button>
                <button type="button" className="btn ghost small" onClick={() => go('plan', { processId: p.id })}>{t('dashboard.plan')}</button>
                <button type="button" className="btn ghost small" onClick={() => go('criteria', { processId: p.id })}>{t('dashboard.criteria')} ({p.items.length})</button>
                <button type="button" className="btn ghost small" onClick={() => go('process', { processId: p.id })}>{t('common.edit')}</button>
                <button type="button" className="btn ghost small" onClick={() => remove(p)}>{t('common.remove')}</button>
              </div>
            </article>
          );
        })}
      </section>

      <IntegrityPanel />
    </>
  );
}
