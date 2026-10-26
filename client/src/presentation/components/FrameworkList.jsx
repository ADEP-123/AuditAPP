import { useEffect, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { frameworksApi } from '../../infrastructure/api/frameworksApi.js';
import { loc } from '../../domain/localize.js';

export default function FrameworkList() {
  const { t, lang } = useI18n();
  const [frameworks, setFrameworks] = useState([]);

  useEffect(() => {
    frameworksApi.list().then(setFrameworks, () => setFrameworks([]));
  }, []);

  if (!frameworks.length) return null;
  return (
    <section className="card">
      <h2>{t('home.frameworks')}</h2>
      <div className="grid">
        {frameworks.map((fw) => (
          <article key={fw.id} className="tile">
            <h3>{loc(fw.name, lang)}</h3>
            <p className="muted">{loc(fw.description, lang)}</p>
            <p className="small">
              {t('home.items', { n: fw.itemCount })} · {fw.publisher} ·{' '}
              <a href={fw.source} target="_blank" rel="noreferrer">{t('home.source')}</a>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
