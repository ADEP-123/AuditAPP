import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useAudit } from '../../application/audit/AuditContext.jsx';
import { useNav } from '../../application/navigation/NavContext.jsx';
import { frameworksApi } from '../../infrastructure/api/frameworksApi.js';
import { STATUS, customItem, findProcess, itemFromCatalog } from '../../domain/audit.js';
import { loc } from '../../domain/localize.js';
import { Field, Modal, PageHeader } from '../components/ui.jsx';

export default function CriteriaPage({ processId }) {
  const { t, lang } = useI18n();
  const { audit, dispatch, logEvent } = useAudit();
  const { go } = useNav();
  const process = findProcess(audit, processId);

  const [list, setList] = useState([]);
  const [fwId, setFwId] = useState(null);
  const [fw, setFw] = useState(null);
  const [filters, setFilters] = useState({ group: '', level: '1', q: '' });
  // clave -> ítem; empieza con lo ya elegido para no perder el avance
  const [selected, setSelected] = useState(() => new Map(process.items.map((i) => [i.key, i])));
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    frameworksApi.list().then((l) => {
      setList(l);
      setFwId((cur) => cur ?? l[0]?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!fwId) return;
    setFw(null);
    setFilters({ group: '', level: '1', q: '' });
    frameworksApi.get(fwId).then(setFw);
  }, [fwId]);

  const groupName = useMemo(() => new Map(fw?.groups.map((g) => [g.id, g.name]) ?? []), [fw]);

  const visible = useMemo(() => {
    if (!fw) return [];
    const q = filters.q.trim().toLowerCase();
    return fw.items.filter((it) => {
      if (filters.group && it.group !== filters.group) return false;
      if (fw.hasLevels && filters.level && it.level > Number(filters.level)) return false;
      if (!q) return true;
      return [it.id, loc(it.title, lang), loc(it.text, lang)].join(' ').toLowerCase().includes(q);
    });
  }, [fw, filters, lang]);

  const keyOf = (it) => `${fw.id}:${it.id}`;
  const toggle = (it) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(keyOf(it))) next.delete(keyOf(it));
      else next.set(keyOf(it), itemFromCatalog(fw, it, groupName.get(it.group)));
      return next;
    });
  const setVisible = (on) =>
    setSelected((prev) => {
      const next = new Map(prev);
      for (const it of visible) {
        if (on && !next.has(keyOf(it))) next.set(keyOf(it), itemFromCatalog(fw, it, groupName.get(it.group)));
        if (!on) next.delete(keyOf(it));
      }
      return next;
    });

  const save = () => {
    const before = new Set(process.items.map((i) => i.key));
    const removedAudited = process.items.filter((i) => !selected.has(i.key) && i.status !== STATUS.PENDING);
    if (removedAudited.length && !window.confirm(t('criteria.confirmRemoveAudited', { n: removedAudited.length }))) return;
    const items = [...selected.values()];
    dispatch({ type: 'updateProcess', id: process.id, patch: { items } });
    logEvent('criteria.updated', {
      processId: process.id,
      added: items.filter((i) => !before.has(i.key)).map((i) => i.key),
      removed: process.items.filter((i) => !selected.has(i.key)).map((i) => i.key),
    });
    go(items.length ? 'checklist' : 'dashboard', { processId: process.id });
  };

  const customCount = [...selected.values()].filter((i) => i.custom).length;

  return (
    <>
      <PageHeader
        title={t('criteria.title')}
        subtitle={`${process.title} · ${t('criteria.selected', { n: selected.size })}`}
        actions={
          <>
            <button type="button" className="btn ghost" onClick={() => setShowCustom(true)}>+ {t('criteria.addCustom')}</button>
            <button type="button" className="btn" onClick={save} disabled={!selected.size}>{t('criteria.save')}</button>
          </>
        }
      />

      <div className="tabs" role="tablist">
        {list.map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={f.id === fwId} className={f.id === fwId ? 'tab active' : 'tab'} onClick={() => setFwId(f.id)}>
            {loc(f.name, lang)}
          </button>
        ))}
      </div>

      <section className="card">
        {!fw && <p className="muted">…</p>}
        {fw && (
          <>
            <p className="small muted">{loc(fw.description, lang)} · {fw.license}</p>
            <div className="filters">
              <select value={filters.group} onChange={(e) => setFilters((f) => ({ ...f, group: e.target.value }))} aria-label={t('criteria.group')}>
                <option value="">{t('criteria.allGroups')}</option>
                {fw.groups.map((g) => <option key={g.id} value={g.id}>{g.id} · {loc(g.name, lang)}</option>)}
              </select>
              {fw.hasLevels && (
                <select value={filters.level} onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))} aria-label={t('criteria.level')}>
                  <option value="1">{t('criteria.levelUpTo', { n: 1 })}</option>
                  <option value="2">{t('criteria.levelUpTo', { n: 2 })}</option>
                  <option value="3">{t('criteria.levelUpTo', { n: 3 })}</option>
                </select>
              )}
              <input type="search" placeholder={t('criteria.search')} value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
              <button type="button" className="btn ghost small" onClick={() => setVisible(true)}>{t('criteria.selectVisible', { n: visible.length })}</button>
              <button type="button" className="btn ghost small" onClick={() => setVisible(false)}>{t('criteria.clearVisible')}</button>
            </div>
            {fw.textLanguages.length > 0 && !fw.textLanguages.includes(lang) && <p className="small muted">{t('criteria.textLanguageNote')}</p>}
            <ul className="checklist">
              {visible.map((it) => (
                <li key={it.id}>
                  <label className="check">
                    <input type="checkbox" checked={selected.has(keyOf(it))} onChange={() => toggle(it)} />
                    <span>
                      <strong>{it.id}</strong>
                      {it.level && <span className="badge muted">L{it.level}</span>}{' '}
                      {loc(it.title, lang) !== it.id && loc(it.title, lang)}
                      {it.text && <span className="block muted small">{loc(it.text, lang)}</span>}
                      <span className="block small muted">{loc(groupName.get(it.group), lang)}{it.section ? ` · ${loc(it.section, lang)}` : ''}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {customCount > 0 && (
        <section className="card">
          <h2>{t('criteria.customCount', { n: customCount })}</h2>
          <ul className="checklist">
            {[...selected.values()].filter((i) => i.custom).map((i) => (
              <li key={i.key} className="row between">
                <span><strong>{i.itemId}</strong> {loc(i.title, lang)}</span>
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => setSelected((prev) => { const n = new Map(prev); n.delete(i.key); return n; })}
                >
                  {t('common.remove')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showCustom && (
        <CustomItemModal
          onClose={() => setShowCustom(false)}
          onAdd={(data) => {
            const item = customItem(data);
            setSelected((prev) => new Map(prev).set(item.key, item));
            setShowCustom(false);
          }}
        />
      )}
    </>
  );
}

function CustomItemModal({ onClose, onAdd }) {
  const { t } = useI18n();
  const [f, setF] = useState({ code: '', title: '', text: '', guidance: '' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Modal
      title={t('criteria.addCustom')}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" className="btn" disabled={!f.title.trim()} onClick={() => onAdd(f)}>{t('common.add')}</button>
        </>
      }
    >
      <Field label={t('criteria.customCode')} hint={t('criteria.customCodeHint')}><input value={f.code} onChange={set('code')} /></Field>
      <Field label={t('criteria.customTitle')} required><input value={f.title} onChange={set('title')} /></Field>
      <Field label={t('criteria.customText')}><textarea rows={3} value={f.text} onChange={set('text')} /></Field>
      <Field label={t('criteria.customGuidance')} hint={t('criteria.customGuidanceHint')}><textarea rows={4} value={f.guidance} onChange={set('guidance')} /></Field>
    </Modal>
  );
}
