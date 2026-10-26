import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { formatDate } from './ui.jsx';

// Resultado de verificar la bitácora y las imágenes de una auditoría.
export default function IntegrityReport({ result }) {
  const { t, lang } = useI18n();
  const { log, imageIssues, valid } = result;
  return (
    <div className={`integrity ${valid ? 'ok' : 'bad'}`}>
      <p>
        <strong>{valid ? `✔ ${t('integrity.valid')}` : `✖ ${t('integrity.invalid')}`}</strong>
        <br />
        <span className="small muted">
          {t('integrity.summary', { n: log.events })} · {formatDate(log.firstServerAt, lang)} → {formatDate(log.lastServerAt, lang)}
        </span>
      </p>
      {log.errors.length > 0 && (
        <ul className="small">
          {log.errors.map((e, i) => <li key={i}>#{e.seq}: {t(`integrity.code.${e.code}`)}</li>)}
        </ul>
      )}
      {imageIssues.length > 0 && (
        <ul className="small">
          {imageIssues.map((im) => <li key={im.id}>{im.name}: {t(`integrity.image.${im.code}`)}</li>)}
        </ul>
      )}
      {log.warnings.length > 0 && (
        <details className="small">
          <summary>{t('integrity.warnings', { n: log.warnings.length })}</summary>
          <ul>{log.warnings.map((w, i) => <li key={i}>#{w.seq}: {t(`integrity.code.${w.code}`)}</li>)}</ul>
        </details>
      )}
    </div>
  );
}
