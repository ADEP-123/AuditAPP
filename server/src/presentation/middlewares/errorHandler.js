export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  // los errores del parser JSON no deben exponer detalles internos
  const message = status >= 500 ? 'Internal server error' : err.type === 'entity.parse.failed' ? 'Invalid JSON' : err.message;
  res.status(status).json({ error: message });
}
