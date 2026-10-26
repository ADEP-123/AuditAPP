import AppHeader from './presentation/components/AppHeader.jsx';
import { useAudit } from './application/audit/AuditContext.jsx';
import { useNav } from './application/navigation/NavContext.jsx';
import { useI18n } from './application/i18n/I18nContext.jsx';
import { findProcess } from './domain/audit.js';
import HomePage from './presentation/pages/HomePage.jsx';
import GeneralPage from './presentation/pages/GeneralPage.jsx';
import DashboardPage from './presentation/pages/DashboardPage.jsx';
import ProcessFormPage from './presentation/pages/ProcessFormPage.jsx';
import CriteriaPage from './presentation/pages/CriteriaPage.jsx';
import ChecklistPage from './presentation/pages/ChecklistPage.jsx';
import ItemAuditPage from './presentation/pages/ItemAuditPage.jsx';
import ActionPlanPage from './presentation/pages/ActionPlanPage.jsx';
import ReportPage from './presentation/pages/ReportPage.jsx';
import SaveFileButton from './presentation/components/SaveFileButton.jsx';

function CurrentView() {
  const { route } = useNav();
  const { audit } = useAudit();
  const { view, processId, itemKey, mode } = route;

  // Vistas que necesitan una auditoría (y un proceso) existentes; si no, inicio.
  if (view === 'home' || (view !== 'general' && !audit)) return <HomePage />;
  if (view === 'general') return <GeneralPage mode={mode} />;
  if (view === 'dashboard') return <DashboardPage />;
  if (view === 'report') return <ReportPage />;
  if (view === 'process') return <ProcessFormPage key={processId ?? 'new'} processId={processId} />;
  if (!findProcess(audit, processId)) return <DashboardPage />;
  if (view === 'criteria') return <CriteriaPage processId={processId} />;
  if (view === 'checklist') return <ChecklistPage processId={processId} />;
  if (view === 'plan') return <ActionPlanPage processId={processId} />;
  if (view === 'item' && findProcess(audit, processId).items.some((i) => i.key === itemKey))
    return <ItemAuditPage processId={processId} itemKey={itemKey} />;
  return <ChecklistPage processId={processId} />;
}

export default function App() {
  const { audit, saveError } = useAudit();
  const { go } = useNav();
  const { t } = useI18n();
  return (
    <>
      <AppHeader onHome={() => go('home')}>
        {audit && <button type="button" className="btn ghost" onClick={() => go('dashboard')}>{t('nav.dashboard')}</button>}
        {audit && <SaveFileButton />}
      </AppHeader>
      {!window.isSecureContext && <p className="banner danger">{t('common.insecure')}</p>}
      {saveError && <p className="banner danger">{t('common.saveError')}</p>}
      <main className="container">
        <CurrentView />
      </main>
    </>
  );
}
