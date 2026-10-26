import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();
app.listen(config.port, () => {
  console.log(`Asistente de Auditoría escuchando en http://localhost:${config.port}`);
});
