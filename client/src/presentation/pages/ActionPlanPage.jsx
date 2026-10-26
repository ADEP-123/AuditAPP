import { useMemo, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { findProcess, uid } from '../../domain/audit.js';
import { PRIORITY_BY_SEVERITY, listFindings } from '../../../../shared/findings.js';
import { Field, PageHeader, SeverityBadge } from '../components/ui.jsx';

const PRIORITIES = ['high', 'medium', 'low'];
const STATES = ['open', 'in_progress', 'closed'];

// Sección C (plan de acción correctivo) y D (interpretación) de cada punto de auditoría.
export default function ActionPlanPage({ processId }) {
  const { t } = useI18n();
  const { audit, dispatch, logEvent } = useAudit();
  const { go } = useNav();
  const process = findProcess(audit, processId);
  const findings = useMemo(() => listFindings(audit).filter((f) => f.process.id === processId), [audit, processId]);

  const [actions, setActions] = useState(process.actionPlan);
  const [interpretation, setInterpretation] = useState(process.interpretation);

  const addAction = (f) =>
    setActions((a) => [
      ...a,
      {
        id: uid(),
        findingKey: f.item.key,
        action: f.finding.recommendation,
        priority: PRIORITY_BY_SEVERITY[f.rating?.severity] ?? 'medium',
        owner: '',
        dueDate: '',
        implementationEvidence: '',
        effectivenessEvidence: '',
        state: 'open',
      },
    ]);
  const update = (id, k) => (e) => setActions((a) => a.map((x) => (x.id === id ? { ...x, [k]: e.target.value } : x)));

  const save = () => {
    // las acciones de hallazgos que ya no existen se descartan
    const valid = new Set(findings.map((f) => f.item.key));
    const kept = actions.filter((a) => valid.has(a.findingKey));
    dispatch({ type: 'updateProcess', id: processId, patch: { actionPlan: kept, interpretation } });
    logEvent('plan.updated', { processId, actions: kept.length, interpretationChars: interpretation.length });
    go('dashboard');
  };

  return (
    <>
      <PageHeader
        title={t('plan.title')}
        subtitle={process.title}
        actions={
          <>
            <button type="button" className="btn ghost" onClick={() => go('dashboard')}>{t('common.cancel')}</button>
            <button type="button" className="btn" onClick={save}>{t('common.save')}</button>
          </>
        }
      />

      {findings.length === 0 && <section className="card"><p className="muted">{t('plan.noFindings')}</p></section>}

      {findings.map((f) => (
        <section key={f.item.key} className="card">
          <div className="row between">
            <h2>{f.code} · {f.finding.title}</h2>
            <SeverityBadge severity={f.rating?.severity} />
          </div>
          <p className="small muted">{f.item.itemId} · {t('finding.recommendation')}: {f.finding.recommendation || '—'}</p>
          {actions.filter((a) => a.findingKey === f.item.key).map((a) => (
            <div key={a.id} className="tile action">
              <Field label={t('plan.action')}><textarea rows={2} value={a.action} onChange={update(a.id, 'action')} /></Field>
              <div className="form-grid">
                <Field label={t('plan.priority')}>
                  <select value={a.priority} onChange={update(a.id, 'priority')}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{t(`priority.${p}`)}</option>)}
                  </select>
                </Field>
                <Field label={t('plan.owner')}><input value={a.owner} onChange={update(a.id, 'owner')} /></Field>
                <Field label={t('plan.dueDate')}><input type="date" value={a.dueDate} onChange={update(a.id, 'dueDate')} /></Field>
                <Field label={t('plan.state')}>
                  <select value={a.state} onChange={update(a.id, 'state')}>
                    {STATES.map((s) => <option key={s} value={s}>{t(`state.${s}`)}</option>)}
                  </select>
                </Field>
              </div>
              <div className="form-grid">
                <Field label={t('plan.implementationEvidence')}><input value={a.implementationEvidence} onChange={update(a.id, 'implementationEvidence')} /></Field>
                <Field label={t('plan.effectivenessEvidence')}><input value={a.effectivenessEvidence} onChange={update(a.id, 'effectivenessEvidence')} /></Field>
              </div>
              <button type="button" className="btn ghost small" onClick={() => setActions((x) => x.filter((y) => y.id !== a.id))}>{t('common.remove')}</button>
            </div>
          ))}
          <button type="button" className="btn ghost small" onClick={() => addAction(f)}>+ {t('plan.addAction')}</button>
        </section>
      ))}

      <section className="card">
        <h2>{t('plan.interpretation')}</h2>
        <Field label={t('plan.interpretationLabel')} hint={t('plan.interpretationHint')}>
          <textarea rows={6} value={interpretation} onChange={(e) => setInterpretation(e.target.value)} />
        </Field>
      </section>
    </>
  );
}
