import { useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { checkAuditFile, collectImages } from '../../application/audit/auditFile.js';
import IntegrityReport from './IntegrityReport.jsx';

export default function IntegrityPanel() {
  const { t } = useI18n();
  const { flush, current } = useAudit();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const verify = async () => {
    setBusy(true);
    setError('');
    try {
      await flush();
      const audit = current();
      setResult(await checkAuditFile({ audit, images: await collectImages(audit) }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <div className="row between">
        <div>
          <h2>{t('integrity.title')}</h2>
          <p className="small muted">{t('integrity.help')}</p>
        </div>
        <button type="button" className="btn ghost" onClick={verify} disabled={busy}>{busy ? '…' : t('integrity.verify')}</button>
      </div>
      {error && <p className="badge danger">{error}</p>}
      {result && <IntegrityReport result={result} />}
    </section>
  );
}
