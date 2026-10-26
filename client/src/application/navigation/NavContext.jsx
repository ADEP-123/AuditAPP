import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Navegación mínima por vistas (sin router): { view, processId, itemKey }.
const NavContext = createContext(null);

export function NavProvider({ children }) {
  const [route, setRoute] = useState({ view: 'home' });
  const go = useCallback((view, params = {}) => {
    setRoute({ view, ...params });
    window.scrollTo(0, 0);
  }, []);
  const value = useMemo(() => ({ route, go }), [route, go]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export const useNav = () => useContext(NavContext);
