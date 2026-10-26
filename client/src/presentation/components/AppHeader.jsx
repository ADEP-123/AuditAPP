import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { useTheme } from '../../application/theme/ThemeContext.jsx';

export default function AppHeader({ children, onHome }) {
  const { t, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="brand" role="button" tabIndex={0} onClick={onHome} onKeyDown={(e) => e.key === 'Enter' && onHome?.()}>
        <span className="brand-mark" aria-hidden="true">✓</span>
        <div>
          <strong>{t('app.title')}</strong>
          <small>{t('app.tagline')}</small>
        </div>
      </div>
      <div className="header-actions">
        {children}
        <button type="button" className="btn ghost" onClick={toggleLang} aria-label={t('header.langAria')}>
          {t('header.lang')}
        </button>
        <button type="button" className="btn ghost" onClick={toggleTheme}>
          {theme === 'dark' ? `☀ ${t('header.themeLight')}` : `☾ ${t('header.themeDark')}`}
        </button>
      </div>
    </header>
  );
}
