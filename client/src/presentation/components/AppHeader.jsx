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
          <small className="hide-sm">{t('app.tagline')}</small>
        </div>
      </div>
      <div className="header-actions">
        {children}
        {/* en celular solo se ven el código del idioma y el ícono del tema */}
        <button type="button" className="btn ghost" onClick={toggleLang} aria-label={t('header.langAria')}>
          <span className="hide-sm">{t('header.lang')}</span>
          <span className="show-sm" aria-hidden="true">{t('header.lang').slice(0, 2).toUpperCase()}</span>
        </button>
        <button type="button" className="btn ghost" onClick={toggleTheme} aria-label={theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}>
          {theme === 'dark' ? '☀' : '☾'} <span className="hide-sm">{theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}</span>
        </button>
      </div>
    </header>
  );
}
