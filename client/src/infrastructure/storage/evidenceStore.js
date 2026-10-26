// Imágenes de evidencia en IndexedDB: localStorage (~5 MB) no alcanza para capturas.
const DB_NAME = 'audit-assistant';
const STORE = 'images';

let dbPromise;
function db() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function run(mode, op) {
  const conn = await db();
  return new Promise((resolve, reject) => {
    const tx = conn.transaction(STORE, mode);
    const req = op(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}

export const evidenceStore = {
  put: (record) => run('readwrite', (s) => s.put(record)), // { id, dataUrl }
  get: (id) => run('readonly', (s) => s.get(id)),
  clear: () => run('readwrite', (s) => s.clear()),
};
