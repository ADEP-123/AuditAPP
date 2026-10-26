import { http } from './httpClient.js';

export const reportsApi = {
  // format: 'docx' | 'pdf'
  generate: (format, payload) => http.postForBlob(`/api/reports/${format}`, payload),
};
