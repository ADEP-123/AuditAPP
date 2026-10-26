import { http } from './httpClient.js';

const cache = new Map();

export const frameworksApi = {
  list: () => http.get('/api/frameworks'),
  // Los catálogos no cambian durante la sesión: se piden una sola vez.
  get(id) {
    if (!cache.has(id)) {
      cache.set(id, http.get(`/api/frameworks/${encodeURIComponent(id)}`).catch((e) => {
        cache.delete(id);
        throw e;
      }));
    }
    return cache.get(id);
  },
};
