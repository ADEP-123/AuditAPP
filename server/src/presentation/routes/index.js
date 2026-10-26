import { Router } from 'express';
import * as system from '../controllers/system.controller.js';
import * as frameworks from '../controllers/frameworks.controller.js';
import { createIntegrityController } from '../controllers/integrity.controller.js';

export function createApiRouter({ integrityService }) {
  const api = Router();
  const integrity = createIntegrityController(integrityService);

  api.get('/health', system.health);
  api.get('/system/context', system.context);

  api.get('/frameworks', frameworks.list);
  api.get('/frameworks/:id', frameworks.get);

  api.post('/integrity/stamp', integrity.stamp);
  api.post('/integrity/verify', integrity.verify);

  return api;
}
