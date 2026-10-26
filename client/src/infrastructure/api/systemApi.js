import { http } from './httpClient.js';

export const systemApi = {
  context: () => http.get('/api/system/context'),
};
