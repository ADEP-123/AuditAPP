# Asistente de Auditoría / Audit Assistant

Aplicación web que guía paso a paso la auditoría de uno o varios procesos de una empresa según
un marco normativo, deja una bitácora con hora, auditor y dispositivo que no se puede alterar
sin que se note, y al final genera el informe en Word y PDF.

Proyecto de aula — Auditoría de Software, Universidad de Santander (UDES), Bucaramanga, 2026.
Caso de estudio: OWASP Juice Shop.

## Qué hace

- **Marcos normativos precargados:** OWASP ASVS 5.0 (345 requisitos, filtrables por capítulo y nivel),
  OWASP Top 10:2025 y los 93 controles del Anexo A de la ISO/IEC 27001:2022. El auditor también
  puede agregar puntos propios.
- **Guía por punto:** el botón *Cómo auditar* muestra pasos sugeridos, pruebas de la OWASP WSTG y
  evidencia recomendada.
- **Auditoría punto a punto:** resultado (cumple, cumple parcialmente, no cumple, no aplica),
  observaciones, evidencias en texto y capturas. Se registra la hora de inicio y fin de cada revisión.
- **Hallazgos CCCER:** criterio, condición, causa, efecto y recomendación, con la calculadora
  OWASP Risk Rating (16 factores → probabilidad, impacto y severidad).
- **Plan de acción e interpretación** por proceso, e interpretación general de la auditoría.
- **Bitácora íntegra:** cada evento queda encadenado con SHA-256 y sellado por el servidor con su hora.
- **Guardar y continuar:** descarga un archivo `.audit.json` y lo retoma después, en este u otro equipo,
  registrando si cambió el auditor o el dispositivo.
- **Informe** en Word (.docx) y PDF con la estructura registro del caso, hallazgos, plan de acción
  e interpretación, más anexos de integridad, bitácora, auditores y dispositivos.
- Español e inglés, modo día y noche.

## Arranque rápido con Docker

Requisito: Docker Desktop (o Docker Engine con el plugin `compose`).

```bash
docker compose up -d --build
```

Abre **http://localhost:8080**. Para detenerla: `docker compose down`. Para ver los registros:
`docker compose logs -f`.

> **La llave de los sellos** se guarda en el volumen `audit-data` (`/app/data/hmac.key`). Si se
> borra el volumen, las bitácoras selladas antes ya no se pueden verificar. Respáldala con
> `docker compose cp app:/app/data/hmac.key ./respaldo-hmac.key`.
> También se puede fijar con la variable de entorno `HMAC_SECRET`.

## Desarrollo sin Docker

Requisito: Node.js 22 o superior.

```bash
npm run install:all     # instala dependencias de server/ y client/
npm run dev:server      # API en http://localhost:8080
npm run dev:client      # interfaz en http://localhost:5173 (en otra terminal)
npm test                # pruebas del servidor y de la lógica compartida
```

Para servir todo desde Express como en producción: `npm run build && npm start`.

## Arquitectura

Frontend (React + Vite) y backend (Node + Express) viven en el mismo repositorio. Ambos siguen una
arquitectura por capas, y la lógica de dominio que necesitan los dos está en `shared/`.

```
┌──────────────────────────── client/src ────────────────────────────┐
│ presentation/   páginas y componentes React                        │
│ application/    estado de la auditoría, bitácora, idioma, tema,    │
│                 casos de uso (exportar, importar)                   │
│ domain/         modelo de auditoría (funciones puras)              │
│ infrastructure/ API HTTP, localStorage, IndexedDB, Web Crypto,     │
│                 datos del dispositivo, geolocalización              │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ HTTP /api
┌──────────────────────────── server/src ────────────────────────────┐
│ presentation/   rutas, controladores, cabeceras de seguridad       │
│ application/    servicios: catálogos, integridad, informes         │
│ infrastructure/ catálogos JSON, llave HMAC, renderizadores         │
│                 Word (docx) y PDF (pdfmake)                         │
└────────────────────────────────────────────────────────────────────┘
shared/  riskRating.js · findings.js · integrity.js · canonical.js · localize.js
```

```
.
├── client/                 interfaz React
├── server/                 API Express
│   ├── src/infrastructure/data/frameworks/   catálogos (ver su README de licencias)
│   └── test/               pruebas (node --test)
├── shared/                 lógica común cliente-servidor
├── docs/FASES.md           ramas, commits y merges de cada fase
├── Dockerfile              compilación en dos etapas
└── docker-compose.yml
```

No hay base de datos. La auditoría en curso se guarda en el navegador (localStorage para el texto e
IndexedDB para las imágenes) y en los archivos `.audit.json` que descarga el auditor.

## Cómo funciona la integridad de la bitácora

1. Cada acción (crear la auditoría, abrir o guardar un punto, cambiar el plan, pausar, reanudar…)
   genera un evento con la hora del equipo, el auditor y la huella del dispositivo.
2. El evento incluye el hash SHA-256 del estado de la auditoría en ese momento y el hash del evento
   anterior, formando una cadena.
3. El servidor sella el hash del evento con su propia hora y una firma HMAC-SHA256.
4. Al verificar (en el panel, al importar un archivo y en el informe) se recalcula todo: si alguien
   editó el JSON, borró un evento o cambió una hora, aparece la alteración.

Límite conocido: quien tenga la llave del servidor podría fabricar sellos. Por eso la llave no sale
del volumen de Docker. Una alteración aceptada al importar queda registrada como evento
`integrity.warning` y aparece en el informe.

## Datos personales

La app registra nombre del auditor, hora, datos técnicos del navegador (sistema, zona horaria,
pantalla, IP vista por el servidor) y, solo si el auditor lo permite, su ubicación. Pide
consentimiento al iniciar (Ley 1581 de 2012) y no envía nada a terceros: los datos quedan en el
navegador y en los archivos que el auditor descarga. El servidor no guarda auditorías.

## Limitaciones

- Un navegador no puede leer el nombre del equipo, la MAC ni el usuario del sistema operativo.
  La "huella" del dispositivo se calcula con lo que sí expone el navegador.
- La ubicación precisa y la firma de la bitácora (Web Crypto) exigen abrir la app en
  `http://localhost` o por `https`. Para usarla desde otros equipos de la red, ponla detrás de un
  proxy con HTTPS.
- El texto oficial de los requisitos ASVS se muestra en inglés, sin traducir, para no alterar el
  requisito. Nombres de capítulos, guías e interfaz están en los dos idiomas.

## Créditos y licencias

- OWASP ASVS 5.0 y OWASP Top 10:2025 — OWASP Foundation, CC BY-SA 4.0.
- ISO/IEC 27001:2022 — solo número y nombre de los controles; el texto de la norma tiene derechos
  de autor y no se incluye.
- Detalle en `server/src/infrastructure/data/frameworks/README.md`.
