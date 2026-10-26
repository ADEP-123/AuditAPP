import { useEffect, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { checkAuditFile, parseAuditFile, restoreImages } from '../../application/audit/auditFile.js';
import { collectDeviceInfo } from '../../infrastructure/device/deviceInfo.js';
import { uid } from '../../domain/audit.js';
import { Field, Modal } from './ui.jsx';
import IntegrityReport from './IntegrityReport.jsx';
import DeviceSummary from './DeviceSummary.jsx';

// Continuar una auditoría desde un archivo: verifica integridad, auditor y dispositivo,
// y deja todo registrado en la bitácora.
export default function ImportModal({ file, onClose }) {
  const { t } = useI18n();
  const { audit: inBrowser, dispatch, logEvent } = useAudit();
  const { go } = useNav();

  const [data, setData] = useState(null);
  const [check, setCheck] = useState(null);
  const [device, setDevice] = useState(null);
  const [error, setError] = useState('');
  const [ack, setAck] = useState(false);
  const [who, setWho] = useState('same');
  const [newAuditor, setNewAuditor] = useState({ name: '', role: '', email: '' });
  const [recordDevice, setRecordDevice] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const parsed = parseAuditFile(await file.text());
        setData(parsed);
        const [c, d] = await Promise.all([checkAuditFile(parsed), collectDeviceInfo()]);
        setCheck(c);
        setDevice(d);
      } catch (e) {
        setError(['invalidJson', 'invalidFormat'].includes(e.message) ? t(`import.error.${e.message}`) : e.message);
      }
    })();
  }, [file, t]);

  if (error) {
    return (
      <Modal title={t('import.title')} onClose={onClose}>
        <p className="badge danger">{error}</p>
      </Modal>
    );
  }
  if (!data || !check || !device) {
    return (
      <Modal title={t('import.title')} onClose={onClose}>
        <p className="muted">{t('import.checking')}</p>
      </Modal>
    );
  }

  const { audit, images } = data;
  const lastAuditor = audit.auditors.find((a) => a.id === audit.currentAuditorId);
  const deviceChanged = device.id !== audit.currentDeviceId;
  const canContinue = (check.valid || ack) && (who === 'same' || newAuditor.name.trim());

  const confirm = async () => {
    if (inBrowser && inBrowser.id !== audit.id && !window.confirm(t('home.confirmReplace'))) return;
    const now = new Date().toISOString();
    const next = { ...audit };
    let added = null;
    if (who === 'other') {
      added = { ...newAuditor, id: uid(), addedAt: now };
      next.auditors = [...audit.auditors, added];
      next.currentAuditorId = added.id;
    }
    if (deviceChanged) {
      next.currentDeviceId = device.id;
      if (recordDevice && !audit.devices.some((d) => d.id === device.id)) next.devices = [...audit.devices, { ...device, firstSeenAt: now }];
    }
    await restoreImages(images);
    dispatch({ type: 'load', audit: next });
    logEvent('session.resumed', { source: 'file', fileName: file.name, integrityValid: check.valid });
    if (!check.valid) logEvent('integrity.warning', { errors: check.log.errors, imageIssues: check.imageIssues });
    if (added) logEvent('auditor.changed', { from: audit.currentAuditorId, to: added.id, name: added.name });
    if (deviceChanged && recordDevice) logEvent('device.changed', { from: audit.currentDeviceId, to: device.id, info: device.info });
    onClose();
    go('dashboard');
  };

  return (
    <Modal
      title={t('import.title')}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" className="btn" disabled={!canContinue} onClick={confirm}>{t('import.continue')}</button>
        </>
      }
    >
      <p><strong>{audit.general.title}</strong> · {audit.general.company}</p>
      <IntegrityReport result={check} />
      {!check.valid && (
        <label className="check warning-box">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          <span>{t('import.ack')}</span>
        </label>
      )}

      <h3>{t('import.whoTitle')}</h3>
      <label className="check">
        <input type="radio" name="who" checked={who === 'same'} onChange={() => setWho('same')} />
        <span>{t('import.same', { name: lastAuditor?.name ?? '—' })}</span>
      </label>
      <label className="check">
        <input type="radio" name="who" checked={who === 'other'} onChange={() => setWho('other')} />
        <span>{t('import.other')}</span>
      </label>
      {who === 'other' && (
        <div className="form-grid">
          <Field label={t('general.auditorName')} required><input value={newAuditor.name} onChange={(e) => setNewAuditor((a) => ({ ...a, name: e.target.value }))} /></Field>
          <Field label={t('general.auditorRole')}><input value={newAuditor.role} onChange={(e) => setNewAuditor((a) => ({ ...a, role: e.target.value }))} /></Field>
          <Field label={t('general.auditorEmail')}><input type="email" value={newAuditor.email} onChange={(e) => setNewAuditor((a) => ({ ...a, email: e.target.value }))} /></Field>
        </div>
      )}

      <h3>{t('import.deviceTitle')}</h3>
      {deviceChanged ? (
        <>
          <p className="small">{t('import.deviceChanged', { from: audit.currentDeviceId, to: device.id })}</p>
          <DeviceSummary device={device} />
          <label className="check">
            <input type="checkbox" checked={recordDevice} onChange={(e) => setRecordDevice(e.target.checked)} />
            <span>{t('import.recordDevice')}</span>
          </label>
        </>
      ) : (
        <p className="small muted">{t('import.deviceSame')}</p>
      )}
    </Modal>
  );
}
