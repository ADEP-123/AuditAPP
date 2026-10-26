import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../../..');
const defaultDist = path.join(projectRoot, 'client', 'dist');

export const config = {
  port: Number(process.env.PORT) || 8080,
  dataDir: process.env.DATA_DIR || path.join(projectRoot, 'data'),
  // El frontend compilado solo se sirve si existe (en desarrollo lo sirve Vite).
  clientDist: process.env.CLIENT_DIST || (fs.existsSync(defaultDist) ? defaultDist : null),
  // Las auditorías exportadas incluyen imágenes en base64.
  jsonLimit: process.env.JSON_LIMIT || '60mb',
  version: '1.0.0',
};
