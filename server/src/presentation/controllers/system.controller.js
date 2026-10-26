import { config } from '../../config/env.js';

export function health(req, res) {
  res.json({ status: 'ok', version: config.version });
}

// Hora del servidor e IP de origen: datos que el navegador del auditor no puede falsear.
export function context(req, res) {
  res.json({ serverTime: new Date().toISOString(), ip: req.ip });
}
