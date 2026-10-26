import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { AUDITED_STATUSES, STATUS, findProcess, needsFinding, uid } from '../../domain/audit.js';
import { isFindingComplete } from '../../../../shared/findings.js';
import { loc } from '../../domain/localize.js';
import { Field, PageHeader, StatusBadge, formatDate, formatDuration } from '../components/ui.jsx';
import GuidanceModal from '../components/GuidanceModal.jsx';
import FindingForm from '../components/FindingForm.jsx';
import ImageEvidence from '../components/ImageEvidence.jsx';

export default function ItemAuditPage({ processId, itemKey }) {
  const { t, lang } = useI18n();
  const { audit, dispatch, logEvent } = useAudit();
  const { go } = useNav();
  const process = findProcess(audit, processId);
  const index = process.items.findIndex((i) => i.key === itemKey);
  const item = process.items[index];

  const formFrom = (it) => ({ status: it.status, notes: it.notes, evidence: it.evidence, images: it.images ?? [], finding: it.finding ?? null });
  const [form, setForm] = useState(() => formFrom(item));
  const [showGuide, setShowGuide] = useState(false);
  const openedAt = useRef(null);

  // Bitácora: inicio de la revisión del punto (una vez por apertura).
  useEffect(() => {
    if (openedAt.current?.key === itemKey) return;
    openedAt.current = { key: itemKey, at: Date.now() };
    setForm(formFrom(item));
    if (!item.startedAt) dispatch({ type: 'updateItem', processId, key: itemKey, patch: { startedAt: new Date().toISOString() } });
    logEvent('item.opened', { processId, key: itemKey });
  }, [itemKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = ['status', 'notes', 'evidence', 'images', 'finding'].some((k) => form[k] !== (item[k] ?? (k === 'images' ? [] : k === 'finding' ? null : undefined)));
  const withFinding = needsFinding(form.status);
  const finding = form.finding ?? newFinding(item, lang);
  const canSave = form.status !== STATUS.PENDING && (!withFinding || isFindingComplete(finding));

  const save = () => {
    const now = Date.now();
    const spent = now - openedAt.current.at;
    openedAt.current = { key: itemKey, at: now };
    dispatch({
      type: 'updateItem',
      processId,
      key: itemKey,
      patch: {
        ...form,
        finding: withFinding ? finding : null, // si ya cumple, no queda hallazgo en el informe
        lastSavedAt: new Date(now).toISOString(),
        timeSpentMs: (item.timeSpentMs || 0) + spent,
      },
    });
    logEvent('item.saved', { processId, key: itemKey, status: form.status, spentMs: spent, images: form.images.map((i) => i.sha256) });
  };

  const goTo = (i) => {
    if (dirty && !window.confirm(t('item.confirmLeave'))) return;
    const target = process.items[i];
    if (target) go('item', { processId, itemKey: target.key });
    else go('checklist', { processId });
  };

  const saveAndNext = () => {
    save();
    const nextPending = process.items.findIndex((x, i) => i > index && x.status === STATUS.PENDING);
    const target = process.items[nextPending >= 0 ? nextPending : index + 1];
    if (target) go('item', { processId, itemKey: target.key });
    else go('checklist', { processId });
  };

  const setEvidence = (id, description) =>
    setForm((f) => ({ ...f, evidence: f.evidence.map((e) => (e.id === id ? { ...e, description } : e)) }));

  return (
    <>
      <PageHeader
        title={`${item.itemId} · ${loc(item.framework.name, lang)}`}
        subtitle={`${process.title} · ${t('item.position', { n: index + 1, total: process.items.length })}`}
        actions={<button type="button" className="btn ghost" onClick={() => goTo(-1)}>{t('item.backToList')}</button>}
      />

      <section className="card">
        <div className="row between">
          <div>
            <span className="small muted">{loc(item.group.name, lang)}{item.level ? ` · L${item.level}` : ''}</span>
            {/* en ASVS el título es el propio ID; se muestra la sección */}
            <h2>{loc(item.title, lang) !== item.itemId ? loc(item.title, lang) : loc(item.section, lang) || item.itemId}</h2>
          </div>
          <button type="button" className="btn ghost" onClick={() => setShowGuide(true)} aria-label={t('item.howTo')}>ⓘ {t('item.howTo')}</button>
        </div>
        {item.text && <blockquote className="requirement">{loc(item.text, lang)}</blockquote>}
        <p className="small muted">
          {t('item.current')}: <StatusBadge status={item.status} /> · {t('item.startedAt')}: {formatDate(item.startedAt, lang)} ·{' '}
          {t('item.lastSaved')}: {formatDate(item.lastSavedAt, lang)} · {t('checklist.time')}: {formatDuration(item.timeSpentMs)}
        </p>
      </section>

      <section className="card">
        <h2>{t('item.result')}</h2>
        <div className="status-options" role="radiogroup" aria-label={t('item.result')}>
          {AUDITED_STATUSES.map((s) => (
            <label key={s} className={`status-option ${form.status === s ? 'on' : ''}`}>
              <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setForm((f) => ({ ...f, status: s }))} />
              <StatusBadge status={s} />
            </label>
          ))}
        </div>
        <Field label={t('item.notes')} hint={t('item.notesHint')}>
          <textarea rows={4} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </Field>

        <h3>{t('item.evidence')}</h3>
        {form.evidence.map((ev) => (
          <div key={ev.id} className="row evidence-row">
            <input value={ev.description} onChange={(e) => setEvidence(ev.id, e.target.value)} placeholder={t('item.evidencePlaceholder')} />
            <button type="button" className="btn ghost small" onClick={() => setForm((f) => ({ ...f, evidence: f.evidence.filter((x) => x.id !== ev.id) }))}>
              {t('common.remove')}
            </button>
          </div>
        ))}
        <button type="button" className="btn ghost small" onClick={() => setForm((f) => ({ ...f, evidence: [...f.evidence, { id: uid(), description: '' }] }))}>
          + {t('item.addEvidence')}
        </button>

        <h3>{t('images.title')}</h3>
        <ImageEvidence images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
      </section>

      {withFinding && <FindingForm finding={finding} onChange={(fd) => setForm((f) => ({ ...f, finding: fd }))} />}
      {withFinding && !isFindingComplete(finding) && <p className="small muted">{t('finding.required')}</p>}

      <div className="row between">
        <div className="row">
          <button type="button" className="btn ghost" disabled={index === 0} onClick={() => goTo(index - 1)}>← {t('item.prev')}</button>
          <button type="button" className="btn ghost" disabled={index === process.items.length - 1} onClick={() => goTo(index + 1)}>{t('item.next')} →</button>
        </div>
        <div className="row">
          <button type="button" className="btn ghost" disabled={!canSave} onClick={save}>{t('common.save')}</button>
          <button type="button" className="btn" disabled={!canSave} onClick={saveAndNext}>{t('item.saveNext')}</button>
        </div>
      </div>

      {showGuide && <GuidanceModal item={item} onClose={() => setShowGuide(false)} />}
    </>
  );
}

// Hallazgo nuevo con el criterio ya escrito a partir del requisito auditado.
function newFinding(item, lang) {
  const req = item.text ? `: ${loc(item.text, lang)}` : ` – ${loc(item.title, lang)}`;
  return {
    title: '',
    criterion: `${loc(item.framework.name, lang)} ${item.itemId}${req}`,
    condition: '',
    cause: '',
    effect: '',
    recommendation: '',
    risk: {},
  };
}
