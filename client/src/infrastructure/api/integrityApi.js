import { http } from './httpClient.js';

export const integrityApi = {
  stamp: (hash) => http.post('/api/integrity/stamp', { hash }),
  verify: (audit) => http.post('/api/integrity/verify', { audit }),
};
