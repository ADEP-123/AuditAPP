import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/frameworks');

// Los catálogos son estáticos: se leen una vez al arrancar.
const frameworks = new Map(
  fs.readdirSync(dataDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')))
    .map((fw) => [fw.id, fw]),
);

export const frameworkRepository = {
  findAll: () => [...frameworks.values()],
  findById: (id) => frameworks.get(id) ?? null,
};
