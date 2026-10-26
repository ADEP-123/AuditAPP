import { useEffect, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { frameworksApi } from '../../infrastructure/api/frameworksApi.js';
import { loc } from '../../domain/localize.js';
import { Modal } from './ui.jsx';

// Botón de información: explica cómo auditar el punto seleccionado.
export default function GuidanceModal({ item, onClose }) {
  const { t, lang } = useI18n();
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (item.custom) return;
    frameworksApi.get(item.frameworkId).then(
      (fw) => setGuide(fw.guidance[item.guidanceKey] ?? fw.guidance[item.group.id] ?? null),
      () => setError(true),
    );
  }, [item]);

  const g = guide?.[lang] ?? guide?.en;
  return (
    <Modal title={`${t('guide.title')} · ${item.itemId}`} onClose={onClose} wide>
      <p><strong>{loc(item.title, lang)}</strong></p>
      {item.text && <blockquote className="requirement">{loc(item.text, lang)}</blockquote>}
      {item.text && !item.text[lang] && <p className="small muted">{t('guide.originalLanguage')}</p>}

      {item.custom && (item.guidance ? <p className="pre">{item.guidance}</p> : <p className="muted">{t('guide.noCustom')}</p>)}
      {error && <p className="badge danger">{t('common.loadError')}</p>}

      {g && (
        <>
          <h3>{t('guide.how')}</h3>
          <ol>{g.how.map((s) => <li key={s}>{s}</li>)}</ol>
          <h3>{t('guide.tests')}</h3>
          <p>{guide.tests.join(' · ')}</p>
          <h3>{t('guide.evidence')}</h3>
          <ul>{g.evidence.map((s) => <li key={s}>{s}</li>)}</ul>
          {guide.related && <p className="small muted">{t('guide.related')}: {guide.related.map((r) => `ASVS ${r}`).join(', ')}</p>}
        </>
      )}
    </Modal>
  );
}
