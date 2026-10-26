// localStorage puede lanzar excepción (modo privado, almacenamiento bloqueado).
export function readPref(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sin persistencia: la preferencia vive solo en memoria */
  }
}
