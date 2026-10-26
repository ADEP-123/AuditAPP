import { useEffect, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { collectDeviceInfo } from '../../infrastructure/device/deviceInfo.js';
import { getLocation } from '../../infrastructure/device/geolocation.js';
import { systemApi } from '../../infrastructure/api/systemApi.js';
import { evidenceStore } from '../../infrastructure/storage/evidenceStore.js';
import { createAudit } from '../../domain/audit.js';
import { Field, PageHeader, formatDate } from '../components/ui.jsx';
import DeviceSummary from '../components/DeviceSummary.jsx';

const EMPTY = { title: '', company: '', context: '', reason: '', scope: '', place: '' };
const EMPTY_AUDITOR = { name: '', role: '', email: '' };

export default function GeneralPage({ mode }) {
  const { t, lang } = useI18n();
  const { audit, dispatch, logEvent } = useAudit();
  const { go } = useNav();
  const isNew = mode === 'new' || !audit;

  const [form, setForm] = useState(() => (isNew ? EMPTY : { ...EMPTY, ...audit.general }));
  const [auditor, setAuditor] = useState(EMPTY_AUDITOR);
  const [consent, setConsent] = useState(!isNew);
  const [device, setDevice] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [coords, setCoords] = useState(isNew ? null : audit.general.coords ?? null);
  const [locStatus, setLocStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    collectDeviceInfo().then(setDevice, (e) => setError(e.message));
    systemApi.context().then(setCtx, () => setCtx(null));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setA = (k) => (e) => setAuditor((a) => ({ ...a, [k]: e.target.value }));

  const askLocation = async () => {
    setLocStatus(t('general.locating'));
    try {
      setCoords(await getLocation());
      setLocStatus('');
    } catch (e) {
      setLocStatus(t(`general.loc.${e.message}`));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const general = { ...form, coords, ip: ctx?.ip ?? null };
    if (isNew) {
      if (!device) return setError(t('general.deviceMissing'));
      const created = createAudit({
        general,
        auditor,
        device: { ...device, ip: ctx?.ip ?? null },
        serverTime: ctx?.serverTime,
      });
      evidenceStore.clear().catch(() => {}); // las imágenes de una auditoría anterior no se mezclan
      dispatch({ type: 'load', audit: created });
      logEvent('audit.created', { title: form.title, company: form.company, consent: true });
    } else {
      dispatch({ type: 'general', patch: general });
      logEvent('general.updated', { fields: Object.keys(form).filter((k) => form[k] !== audit.general[k]) });
    }
    go('dashboard');
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={t(isNew ? 'general.titleNew' : 'general.titleEdit')} subtitle={t('general.subtitle')} />

      <section className="card">
        <h2>{t('general.auto')}</h2>
        <dl className="kv small">
          <dt>{t('general.date')}</dt>
          <dd>{formatDate(isNew ? ctx?.serverTime : audit.createdAt, lang)} <span className="muted">({t('general.serverClock')})</span></dd>
        </dl>
        <DeviceSummary device={isNew ? device : audit.devices.find((d) => d.id === audit.currentDeviceId)} ip={ctx?.ip} />
        <div className="row">
          <button type="button" className="btn ghost small" onClick={askLocation}>📍 {t('general.getLocation')}</button>
          {coords && <span className="small">{coords.lat}, {coords.lon} (±{coords.accuracyM} m)</span>}
          {locStatus && <span className="small muted">{locStatus}</span>}
        </div>
      </section>

      {isNew && (
        <section className="card">
          <h2>{t('general.auditor')}</h2>
          <div className="form-grid">
            <Field label={t('general.auditorName')} required><input required value={auditor.name} onChange={setA('name')} /></Field>
            <Field label={t('general.auditorRole')}><input value={auditor.role} onChange={setA('role')} /></Field>
            <Field label={t('general.auditorEmail')}><input type="email" value={auditor.email} onChange={setA('email')} /></Field>
          </div>
        </section>
      )}

      <section className="card">
        <h2>{t('general.audit')}</h2>
        <div className="form-grid">
          <Field label={t('general.company')} required><input required value={form.company} onChange={set('company')} /></Field>
          <Field label={t('general.auditTitle')} required><input required value={form.title} onChange={set('title')} /></Field>
          <Field label={t('general.place')} hint={t('general.placeHint')}><input value={form.place} onChange={set('place')} /></Field>
        </div>
        <Field label={t('general.context')} required><textarea required rows={4} value={form.context} onChange={set('context')} /></Field>
        <Field label={t('general.reason')} required><textarea required rows={3} value={form.reason} onChange={set('reason')} /></Field>
        <Field label={t('general.scope')}><textarea rows={3} value={form.scope} onChange={set('scope')} /></Field>
      </section>

      {isNew && (
        <section className="card consent">
          <label className="check">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
            <span>{t('general.consent')}</span>
          </label>
        </section>
      )}

      {error && <p className="badge danger">{error}</p>}
      <div className="row end">
        <button type="button" className="btn ghost" onClick={() => go(isNew ? 'home' : 'dashboard')}>{t('common.cancel')}</button>
        <button type="submit" className="btn" disabled={isNew && (!consent || !device)}>{t(isNew ? 'general.start' : 'common.save')}</button>
      </div>
    </form>
  );
}
