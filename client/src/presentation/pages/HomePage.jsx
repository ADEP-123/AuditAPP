import { useEffect, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { http } from '../../infrastructure/api/httpClient.js';
import { evidenceStore } from '../../infrastructure/storage/evidenceStore.js';
import FrameworkList from '../components/FrameworkList.jsx';
import ImportModal from '../components/ImportModal.jsx';
import { formatDate } from '../components/ui.jsx';

export default function HomePage() {
  const { t, lang } = useI18n();
  const { audit, dispatch, logEvent } = useAudit();
  const { go } = useNav();
  const [serverOk, setServerOk] = useState(null);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    http.get('/api/health').then(() => setServerOk(true), () => setServerOk(false));
  }, []);

  const startNew = () => {
    if (audit && !window.confirm(t('home.confirmReplace'))) return;
    go('general', { mode: 'new' });
  };

  const resume = () => {
    logEvent('session.resumed', { source: 'browser' });
    go('dashboard');
  };

  const discard = () => {
    if (!window.confirm(t('home.confirmDiscard'))) return;
    dispatch({ type: 'clear' });
    evidenceStore.clear().catch(() => {});
  };

  return (
    <>
      <section className="card hero">
        <h1>{t('app.title')}</h1>
        <p className="muted">{t('home.welcome')}</p>
        <div className="row">
          <button type="button" className="btn" onClick={startNew}>{t('home.new')}</button>
          <label className="btn ghost file-btn">
            📂 {t('home.fromFile')}
            <input type="file" accept=".json,application/json" hidden onChange={(e) => { setImportFile(e.target.files[0] ?? null); e.target.value = ''; }} />
          </label>
        </div>
        <p className="status-line small">
          {t('home.server')}:{' '}
          <span className={serverOk ? 'badge success' : 'badge danger'}>
            {serverOk === null ? '…' : serverOk ? t('home.serverOk') : t('home.serverDown')}
          </span>
        </p>
      </section>

      {audit && (
        <section className="card">
          <h2>{t('home.current')}</h2>
          <p>
            <strong>{audit.general.title}</strong> · {audit.general.company}
            <br />
            <span className="muted small">{t('home.startedAt')}: {formatDate(audit.createdAt, lang)}</span>
          </p>
          <div className="row">
            <button type="button" className="btn" onClick={resume}>{t('home.resume')}</button>
            <button type="button" className="btn ghost" onClick={discard}>{t('home.discard')}</button>
          </div>
        </section>
      )}

      <FrameworkList />
      {importFile && <ImportModal file={importFile} onClose={() => setImportFile(null)} />}
    </>
  );
}
