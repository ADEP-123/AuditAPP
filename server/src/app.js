import express from 'express';
import path from 'node:path';
import { config } from './config/env.js';
import { createApiRouter } from './presentation/routes/index.js';
import { securityHeaders } from './presentation/middlewares/securityHeaders.js';
import { errorHandler, notFound } from './presentation/middlewares/errorHandler.js';
import { loadOrCreateKey } from './infrastructure/keys/hmacKeyStore.js';
import { createIntegrityService } from './application/services/integrityService.js';
import { createReportService } from './application/services/reportService.js';
import { renderDocx } from './infrastructure/reports/docxRenderer.js';
import { renderPdf } from './infrastructure/reports/pdfRenderer.js';

// Raíz de composición: aquí se crean las dependencias y se inyectan en las capas.
export function createApp({ key = loadOrCreateKey(config.dataDir) } = {}) {
  const integrityService = createIntegrityService(key);
  const reportService = createReportService({ integrityService, renderers: { docx: renderDocx, pdf: renderPdf } });
  const apiRouter = createApiRouter({ integrityService, reportService });
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback');

  app.use(securityHeaders);
  app.use(express.json({ limit: config.jsonLimit }));

  app.use('/api', apiRouter, notFound);

  if (config.clientDist) {
    app.use(express.static(config.clientDist));
    // SPA: cualquier GET que no sea de la API devuelve index.html
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(config.clientDist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
