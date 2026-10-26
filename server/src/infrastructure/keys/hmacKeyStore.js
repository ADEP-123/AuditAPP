import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Llave de los sellos de tiempo. Se crea una vez y se guarda en DATA_DIR (volumen de Docker):
// si se pierde, los sellos anteriores ya no se pueden verificar.
export function loadOrCreateKey(dataDir) {
  if (process.env.HMAC_SECRET) return Buffer.from(process.env.HMAC_SECRET, 'utf8');
  const file = path.join(dataDir, 'hmac.key');
  if (fs.existsSync(file)) return Buffer.from(fs.readFileSync(file, 'utf8').trim(), 'hex');
  fs.mkdirSync(dataDir, { recursive: true });
  const key = crypto.randomBytes(32);
  fs.writeFileSync(file, key.toString('hex'), { mode: 0o600 });
  console.log(`Llave de sellos creada en ${file}`);
  return key;
}
