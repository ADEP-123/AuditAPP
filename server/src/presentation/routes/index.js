import { Router } from 'express';
import * as system from '../controllers/system.controller.js';
import * as frameworks from '../controllers/frameworks.controller.js';

export const apiRouter = Router();

apiRouter.get('/health', system.health);
apiRouter.get('/system/context', system.context);

apiRouter.get('/frameworks', frameworks.list);
apiRouter.get('/frameworks/:id', frameworks.get);
