import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from './application/i18n/I18nContext.jsx';
import { ThemeProvider } from './application/theme/ThemeContext.jsx';
import { AuditProvider } from './application/audit/AuditContext.jsx';
import { NavProvider } from './application/navigation/NavContext.jsx';
import App from './App.jsx';
// fuentes servidas por la propia app (la CSP no permite fuentes externas)
import '@fontsource/bitter/600.css';
import '@fontsource/bitter/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './presentation/styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <AuditProvider>
          <NavProvider>
            <App />
          </NavProvider>
        </AuditProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
