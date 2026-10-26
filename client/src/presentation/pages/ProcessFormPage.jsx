import { useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { createProcess, findProcess } from '../../domain/audit.js';
import { Field, PageHeader } from '../components/ui.jsx';

const FIELDS = { title: '', system: '', asset: '', context: '', reason: '', scope: '' };

export default function ProcessFormPage({ processId }) {
  const { t } = useI18n();
  const { audit, dispatch, logEvent } = useAudit();
  const { go } = useNav();
  const existing = findProcess(audit, processId);
  const [form, setForm] = useState(() => (existing ? Object.fromEntries(Object.keys(FIELDS).map((k) => [k, existing[k] ?? ''])) : FIELDS));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (existing) {
      dispatch({ type: 'updateProcess', id: existing.id, patch: form });
      logEvent('process.updated', { processId: existing.id, title: form.title });
      go('dashboard');
    } else {
      const process = createProcess(form);
      dispatch({ type: 'addProcess', process });
      logEvent('process.created', { processId: process.id, title: form.title });
      go('criteria', { processId: process.id });
    }
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={t(existing ? 'process.titleEdit' : 'process.titleNew')} subtitle={t('process.subtitle')} />
      <section className="card">
        <div className="form-grid">
          <Field label={t('process.title')} required><input required value={form.title} onChange={set('title')} /></Field>
          <Field label={t('process.system')} required><input required value={form.system} onChange={set('system')} /></Field>
          <Field label={t('process.asset')}><input value={form.asset} onChange={set('asset')} /></Field>
        </div>
        <Field label={t('process.context')} required><textarea required rows={4} value={form.context} onChange={set('context')} /></Field>
        <Field label={t('process.reason')} required hint={t('process.reasonHint')}><textarea required rows={3} value={form.reason} onChange={set('reason')} /></Field>
        <Field label={t('process.scope')} hint={t('process.scopeHint')}><textarea rows={3} value={form.scope} onChange={set('scope')} /></Field>
      </section>
      <div className="row end">
        <button type="button" className="btn ghost" onClick={() => go('dashboard')}>{t('common.cancel')}</button>
        <button type="submit" className="btn">{t(existing ? 'common.save' : 'process.next')}</button>
      </div>
    </form>
  );
}
