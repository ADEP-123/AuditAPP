import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readPref, writePref } from '../../infrastructure/storage/prefs.js';
import es from './locales/es.js';
import en from './locales/en.js';

const dictionaries = { es, en };
const I18nContext = createContext(null);

function initialLang() {
  const saved = readPref('lang', null);
  if (saved && dictionaries[saved]) return saved;
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    writePref('lang', lang);
  }, [lang]);

  // t('clave', { var }) -> reemplaza {var}; si falta la clave devuelve la clave.
  const t = useCallback(
    (key, vars) => {
      const text = dictionaries[lang][key] ?? dictionaries.es[key] ?? key;
      return vars ? text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : text;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, toggleLang: () => setLang((l) => (l === 'es' ? 'en' : 'es')) }),
    [lang, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
