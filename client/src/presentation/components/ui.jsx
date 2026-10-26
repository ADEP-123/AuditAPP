import { useEffect, useRef } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { STATUS } from '../../domain/audit.js';

export function Field({ label, hint, required, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  );
}

export function Modal({ title, onClose, children, footer, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d.open) d.showModal();
    return () => d.open && d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? 'modal wide' : 'modal'}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <header className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="btn ghost small" onClick={onClose} aria-label="✕">✕</button>
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-foot">{footer}</footer>}
    </dialog>
  );
}

const STATUS_CLASS = {
  [STATUS.PENDING]: 'muted',
  [STATUS.COMPLIANT]: 'success',
  [STATUS.PARTIAL]: 'warning',
  [STATUS.NON_COMPLIANT]: 'danger',
  [STATUS.NOT_APPLICABLE]: 'info',
};

export function StatusBadge({ status }) {
  const { t } = useI18n();
  return <span className={`badge ${STATUS_CLASS[status]}`}>{t(`status.${status}`)}</span>;
}

export function ProgressBar({ pct }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function formatDate(iso, lang) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(lang === 'es' ? 'es-CO' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDuration(ms) {
  const m = Math.round((ms || 0) / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}
