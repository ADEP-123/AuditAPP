import { useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { exportAuditFile } from '../../application/audit/auditFile.js';

// "Guardar para continuar después": registra la hora de pausa y descarga el archivo .audit.json.
export default function SaveFileButton() {
  const { t } = useI18n();
  const { logEvent, flush, current } = useAudit();
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      logEvent('session.paused', { reason: 'export' });
      await flush();
      await exportAuditFile(current());
    } catch (e) {
      window.alert(t('file.exportError', { msg: e.message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className="btn ghost" onClick={save} disabled={busy} title={t('file.saveHint')} aria-label={t('file.save')}>
      💾 <span className="hide-sm">{busy ? '…' : t('file.save')}</span>
    </button>
  );
}
