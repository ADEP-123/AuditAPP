import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readPref, writePref } from '../../infrastructure/storage/prefs.js';

const ThemeContext = createContext(null);

function initialTheme() {
  const saved = readPref('theme', null);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writePref('theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, toggleTheme: () => setTheme((x) => (x === 'dark' ? 'light' : 'dark')) }),
    [theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
