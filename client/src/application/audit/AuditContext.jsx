import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { auditStorage } from '../../infrastructure/storage/auditStorage.js';
import { systemApi } from '../../infrastructure/api/systemApi.js';

const AuditContext = createContext(null);

const mapProcess = (state, id, fn) => ({
  ...state,
  processes: state.processes.map((p) => (p.id === id ? fn(p) : p)),
});

function reducer(state, action) {
  switch (action.type) {
    case 'load':
      return action.audit;
    case 'clear':
      return null;
    case 'patch':
      return { ...state, ...action.patch };
    case 'general':
      return { ...state, general: { ...state.general, ...action.patch } };
    case 'addProcess':
      return { ...state, processes: [...state.processes, action.process] };
    case 'updateProcess':
      return mapProcess(state, action.id, (p) => ({ ...p, ...action.patch }));
    case 'removeProcess':
      return { ...state, processes: state.processes.filter((p) => p.id !== action.id) };
    case 'updateItem':
      return mapProcess(state, action.processId, (p) => ({
        ...p,
        items: p.items.map((i) => (i.key === action.key ? { ...i, ...action.patch } : i)),
      }));
    case 'log':
      return { ...state, log: [...state.log, { seq: state.log.length + 1, ...action.event }] };
    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

export function AuditProvider({ children }) {
  const [audit, dispatch] = useReducer(reducer, undefined, auditStorage.load);
  const [saveError, setSaveError] = useState(false);
  const auditRef = useRef(audit);
  auditRef.current = audit;

  // Autoguardado inmediato: si el auditor cierra la pestaña justo después de guardar, no se pierde nada.
  useEffect(() => {
    setSaveError(!auditStorage.save(audit));
  }, [audit]);

  // Bitácora: los eventos se registran en orden, con la hora del navegador y la del servidor.
  const queue = useRef(Promise.resolve());
  const logEvent = useCallback((type, data = {}) => {
    const clientAt = new Date().toISOString();
    queue.current = queue.current.then(async () => {
      const ctx = await systemApi.context().catch(() => null);
      const current = auditRef.current; // leído después de esperar: incluye cambios recién despachados
      if (!current) return;
      dispatch({
        type: 'log',
        event: {
          type,
          clientAt,
          serverAt: ctx?.serverTime ?? null,
          auditorId: current.currentAuditorId,
          deviceId: current.currentDeviceId,
          data,
        },
      });
    });
    return queue.current;
  }, []);

  const value = useMemo(() => ({ audit, dispatch, logEvent, saveError }), [audit, logEvent, saveError]);
  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export const useAudit = () => useContext(AuditContext);
