import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { auditStorage } from '../../infrastructure/storage/auditStorage.js';
import { integrityApi } from '../../infrastructure/api/integrityApi.js';
import { sha256Hex } from '../../infrastructure/crypto/hash.js';
import { GENESIS, contentString, eventString } from '../../../../shared/integrity.js';

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
    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

export function AuditProvider({ children }) {
  const [audit, setAudit] = useState(auditStorage.load);
  const [saveError, setSaveError] = useState(false);
  // ref = estado más reciente, actualizado de forma síncrona: la bitácora siempre ve el último cambio.
  const ref = useRef(audit);

  const commit = useCallback((next) => {
    ref.current = next;
    setAudit(next);
  }, []);
  const dispatch = useCallback((action) => commit(reducer(ref.current, action)), [commit]);

  // Autoguardado inmediato: si el auditor cierra la pestaña justo después de guardar, no se pierde nada.
  useEffect(() => {
    setSaveError(!auditStorage.save(audit));
  }, [audit]);

  // Bitácora encadenada: cada evento lleva el hash del anterior, el hash del estado de la auditoría
  // y el sello de tiempo del servidor. Los eventos se procesan uno a uno, en orden.
  const queue = useRef(Promise.resolve());
  const logEvent = useCallback(
    (type, data = {}) => {
      const clientAt = new Date().toISOString();
      queue.current = queue.current
        .then(async () => {
          const cur = ref.current;
          if (!cur) return;
          const prev = cur.log.at(-1);
          const event = {
            seq: cur.log.length + 1,
            type,
            clientAt,
            auditorId: cur.currentAuditorId,
            deviceId: cur.currentDeviceId,
            data,
            stateHash: await sha256Hex(contentString(cur)),
            prevHash: prev?.hash ?? GENESIS,
          };
          event.hash = await sha256Hex(eventString(event));
          Object.assign(event, await integrityApi.stamp(event.hash).catch(() => ({ serverAt: null, stamp: null })));
          const latest = ref.current;
          if (latest?.id !== cur.id) return; // la auditoría fue reemplazada o descartada
          commit({ ...latest, log: [...latest.log, event] });
        })
        .catch((e) => console.error('No se pudo registrar el evento', type, e));
      return queue.current;
    },
    [commit],
  );

  // Espera a que todos los eventos pendientes queden registrados (antes de exportar).
  const flush = useCallback(() => queue.current, []);
  const current = useCallback(() => ref.current, []);

  const value = useMemo(
    () => ({ audit, dispatch, logEvent, flush, current, saveError }),
    [audit, dispatch, logEvent, flush, current, saveError],
  );
  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export const useAudit = () => useContext(AuditContext);
