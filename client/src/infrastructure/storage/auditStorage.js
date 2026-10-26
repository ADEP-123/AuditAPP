// La auditoría en curso (solo texto) vive en localStorage; las imágenes van en IndexedDB.
const KEY = 'audit.current';

export const auditStorage = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  save(audit) {
    try {
      if (audit) localStorage.setItem(KEY, JSON.stringify(audit));
      else localStorage.removeItem(KEY);
      return true;
    } catch {
      return false; // cuota llena o almacenamiento bloqueado: la UI avisa
    }
  },
};
