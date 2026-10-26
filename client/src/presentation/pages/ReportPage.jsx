import { useMemo, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { collectImages } from '../../application/audit/auditFile.js';
import { reportsApi } from '../../infrastructure/api/reportsApi.js';
import { downloadBlob, slug } from '../../infrastructure/files/download.js';
import { STATUS } from '../../domain/audit.js';
import { listFindings } from '../../../../shared/findings.js';
import { SEVERITY_ORDER } from '../../../../shared/riskRating.js';
import { Field, PageHeader, SeverityBadge } from '../components/ui.jsx';
import IntegrityPanel from '../components/IntegrityPanel.jsx';

// Interpretación general y descarga del informe final (Word y PDF).
export default function ReportPage() {
  const { t, lang } = useI18n();
  const { audit, dispatch, logEvent, flush, current } = useAudit();
  const { go } = useNav();
  const [conclusion, setConclusion] = useState(audit.conclusion ?? '');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const items = audit.processes.flatMap((p) => p.items);
  const pending = items.filter((i) => i.status === STATUS.PENDING).length;
  const findings = useMemo(() => listFindings(audit), [audit]);

  const saveConclusion = () => {
    dispatch({ type: 'patch', patch: { conclusion } });
    logEvent('conclusion.updated', { chars: conclusion.length });
  };

  const download = async (format) => {
    setBusy(format);
    setError('');
    try {
      if (conclusion !== audit.conclusion) saveConclusion();
      await flush();
      const snapshot = current();
      const blob = await reportsApi.generate(format, { audit: snapshot, images: await collectImages(snapshot), lang });
      downloadBlob(blob, `informe-auditoria-${slug(snapshot.general.company)}-${new Date().toISOString().slice(0, 10)}.${format}`);
      logEvent('report.generated', { format, lang });
    } catch (e) {
      setError(t('report.error', { msg: e.message }));
    } finally {
      setBusy('');
    }
  };

  const finish = () => {
    if (pending && !window.confirm(t('report.confirmFinish', { n: pending }))) return;
    dispatch({ type: 'patch', patch: { status: 'finished', conclusion } });
    logEvent('audit.finished', { pending });
  };

  return (
    <>
      <PageHeader
        title={t('report.title')}
        subtitle={`${audit.general.title} · ${audit.general.company}`}
        actions={<button type="button" className="btn ghost" onClick={() => go('dashboard')}>{t('common.back')}</button>}
      />

      <section className="card">
        <h2>{t('report.summary')}</h2>
        <div className="stats">
          <div><strong>{audit.processes.length}</strong><span>{t('report.points')}</span></div>
          <div><strong>{items.length - pending}/{items.length}</strong><span>{t('report.reviewed')}</span></div>
          <div><strong>{findings.length}</strong><span>{t('report.findings')}</span></div>
        </div>
        <div className="row">
          {[...SEVERITY_ORDER].reverse().map((s) => {
            const n = findings.filter((f) => f.rating?.severity === s).length;
            return n ? <span key={s}><SeverityBadge severity={s} /> × {n}</span> : null;
          })}
        </div>
        {pending > 0 && <p className="small warning-text">{t('report.pending', { n: pending })}</p>}
      </section>

      <section className="card">
        <h2>{t('report.conclusion')}</h2>
        <Field label={t('report.conclusionLabel')} hint={t('report.conclusionHint')}>
          <textarea rows={8} value={conclusion} onChange={(e) => setConclusion(e.target.value)} />
        </Field>
        <div className="row end">
          <button type="button" className="btn ghost" disabled={conclusion === audit.conclusion} onClick={saveConclusion}>{t('common.save')}</button>
        </div>
      </section>

      <IntegrityPanel />

      <section className="card">
        <h2>{t('report.download')}</h2>
        <p className="small muted">{t('report.downloadHelp')}</p>
        <div className="row">
          <button type="button" className="btn" disabled={!!busy} onClick={() => download('docx')}>{busy === 'docx' ? '…' : `⬇ ${t('report.word')}`}</button>
          <button type="button" className="btn" disabled={!!busy} onClick={() => download('pdf')}>{busy === 'pdf' ? '…' : `⬇ ${t('report.pdf')}`}</button>
          {audit.status !== 'finished' ? (
            <button type="button" className="btn ghost" onClick={finish}>{t('report.finish')}</button>
          ) : (
            <span className="badge success">{t('report.finished')}</span>
          )}
        </div>
        {error && <p className="badge danger">{error}</p>}
      </section>
    </>
  );
}
