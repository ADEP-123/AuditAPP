import { useI18n } from '../../application/i18n/I18nContext.jsx';
import Seal from './Seal.jsx';

export default function AppFooter() {
  const { t } = useI18n();
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <Seal size={28} />
        <p>{t('footer.credit')}</p>
      </div>
    </footer>
  );
}
