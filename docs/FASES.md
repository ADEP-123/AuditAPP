# Fases del proyecto: ramas, commits y merges

El desarrollo se hizo en nueve fases. Cada fase vive en su propia rama, que sale de `main` y vuelve
a `main` con un merge sin fast-forward (`--no-ff`), así el historial muestra cada fase como un bloque.
Este documento se generó a partir del historial real del repositorio.

```
* 312cb3b Merge branch 'fase-8/ajustes-interfaz-responsive' into main
* 33fce35 Merge branch 'fase-7/pruebas-documentacion' into main
* 5d12e7e Merge branch 'fase-6/informes' into main
* 1ea7557 Merge branch 'fase-5/bitacora-integridad' into main
* 82067b0 Merge branch 'fase-4/hallazgos-riesgo' into main
* cb4453a Merge branch 'fase-3/flujo-auditoria' into main
* 16eb819 Merge branch 'fase-2/catalogos-normativos' into main
* 048f8db Merge branch 'fase-1/estructura-base' into main
* c575e4a chore: inicializa el repositorio con README y .gitignore
```

## Subir el repositorio a GitHub

El repositorio ya trae todas las ramas e historial. Para publicarlo:

```bash
git remote add origin https://github.com/<usuario>/asistente-auditoria.git
git push -u origin main
git push origin --all      # sube también las ramas de cada fase
```

## Commit inicial (rama `main`)

#### `c575e4a` chore: inicializa el repositorio con README y .gitignore

```bash
git add .gitignore \
  README.md
git commit -m "chore: inicializa el repositorio con README y .gitignore"
```

| Estado | Archivo |
|---|---|
| nuevo | `.gitignore` |
| nuevo | `README.md` |

## Fase 1: Estructura base: servidor Express y cliente React por capas, idioma español/inglés, modo día/noche y Docker

Rama: `fase-1/estructura-base`

```bash
git checkout main
git checkout -b fase-1/estructura-base
```

#### `06dd96a` feat(server): servidor Express por capas con salud, hora del servidor y cabeceras de seguridad

```bash
git add server/package-lock.json \
  server/package.json \
  server/src/app.js \
  server/src/config/env.js \
  server/src/index.js \
  server/src/presentation/controllers/system.controller.js \
  server/src/presentation/middlewares/errorHandler.js \
  server/src/presentation/middlewares/securityHeaders.js \
  server/src/presentation/routes/index.js
git commit -m "feat(server): servidor Express por capas con salud, hora del servidor y cabeceras de seguridad"
```

| Estado | Archivo |
|---|---|
| nuevo | `server/package-lock.json` |
| nuevo | `server/package.json` |
| nuevo | `server/src/app.js` |
| nuevo | `server/src/config/env.js` |
| nuevo | `server/src/index.js` |
| nuevo | `server/src/presentation/controllers/system.controller.js` |
| nuevo | `server/src/presentation/middlewares/errorHandler.js` |
| nuevo | `server/src/presentation/middlewares/securityHeaders.js` |
| nuevo | `server/src/presentation/routes/index.js` |

#### `c10704b` feat(client): app React con Vite, idioma español/inglés y modo día/noche

```bash
git add client/index.html \
  client/package-lock.json \
  client/package.json \
  client/src/App.jsx \
  client/src/application/i18n/I18nContext.jsx \
  client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/application/theme/ThemeContext.jsx \
  client/src/infrastructure/api/httpClient.js \
  client/src/infrastructure/storage/prefs.js \
  client/src/main.jsx \
  client/src/presentation/components/AppHeader.jsx \
  client/src/presentation/pages/HomePage.jsx \
  client/src/presentation/styles/global.css \
  client/vite.config.js
git commit -m "feat(client): app React con Vite, idioma español/inglés y modo día/noche"
```

| Estado | Archivo |
|---|---|
| nuevo | `client/index.html` |
| nuevo | `client/package-lock.json` |
| nuevo | `client/package.json` |
| nuevo | `client/src/App.jsx` |
| nuevo | `client/src/application/i18n/I18nContext.jsx` |
| nuevo | `client/src/application/i18n/locales/en.js` |
| nuevo | `client/src/application/i18n/locales/es.js` |
| nuevo | `client/src/application/theme/ThemeContext.jsx` |
| nuevo | `client/src/infrastructure/api/httpClient.js` |
| nuevo | `client/src/infrastructure/storage/prefs.js` |
| nuevo | `client/src/main.jsx` |
| nuevo | `client/src/presentation/components/AppHeader.jsx` |
| nuevo | `client/src/presentation/pages/HomePage.jsx` |
| nuevo | `client/src/presentation/styles/global.css` |
| nuevo | `client/vite.config.js` |

#### `32050d6` build: Dockerfile multietapa, docker-compose y scripts raíz del proyecto

```bash
git add .dockerignore \
  Dockerfile \
  docker-compose.yml \
  package.json
git commit -m "build: Dockerfile multietapa, docker-compose y scripts raíz del proyecto"
```

| Estado | Archivo |
|---|---|
| nuevo | `.dockerignore` |
| nuevo | `Dockerfile` |
| nuevo | `docker-compose.yml` |
| nuevo | `package.json` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-1/estructura-base -m "Merge branch 'fase-1/estructura-base' into main"
```
Commit de merge: `048f8db`

## Fase 2: Catálogos normativos: OWASP ASVS 5.0, OWASP Top 10:2025 e ISO/IEC 27001:2022 Anexo A con guías de auditoría

Rama: `fase-2/catalogos-normativos`

```bash
git checkout main
git checkout -b fase-2/catalogos-normativos
```

#### `d8c243d` feat(data): catálogos ASVS 5.0, OWASP Top 10:2025 e ISO/IEC 27001:2022 Anexo A con guías es/en

```bash
git add .dockerignore \
  .gitignore \
  server/src/infrastructure/data/frameworks/README.md \
  server/src/infrastructure/data/frameworks/asvs-5.0.json \
  server/src/infrastructure/data/frameworks/iso27001-2022.json \
  server/src/infrastructure/data/frameworks/owasp-top10-2025.json
git commit -m "feat(data): catálogos ASVS 5.0, OWASP Top 10:2025 e ISO/IEC 27001:2022 Anexo A con guías es/en"
```

| Estado | Archivo |
|---|---|
| modificado | `.dockerignore` |
| modificado | `.gitignore` |
| nuevo | `server/src/infrastructure/data/frameworks/README.md` |
| nuevo | `server/src/infrastructure/data/frameworks/asvs-5.0.json` |
| nuevo | `server/src/infrastructure/data/frameworks/iso27001-2022.json` |
| nuevo | `server/src/infrastructure/data/frameworks/owasp-top10-2025.json` |

#### `c794a0b` feat(server): API de marcos normativos con repositorio, servicio y controlador

```bash
git add server/src/application/errors.js \
  server/src/application/services/frameworkService.js \
  server/src/infrastructure/repositories/frameworkRepository.js \
  server/src/presentation/controllers/frameworks.controller.js \
  server/src/presentation/middlewares/errorHandler.js \
  server/src/presentation/routes/index.js
git commit -m "feat(server): API de marcos normativos con repositorio, servicio y controlador"
```

| Estado | Archivo |
|---|---|
| nuevo | `server/src/application/errors.js` |
| nuevo | `server/src/application/services/frameworkService.js` |
| nuevo | `server/src/infrastructure/repositories/frameworkRepository.js` |
| nuevo | `server/src/presentation/controllers/frameworks.controller.js` |
| modificado | `server/src/presentation/middlewares/errorHandler.js` |
| modificado | `server/src/presentation/routes/index.js` |

#### `54e0df7` feat(client): consulta y muestra los marcos normativos disponibles

```bash
git add client/src/App.jsx \
  client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/domain/localize.js \
  client/src/infrastructure/api/frameworksApi.js \
  client/src/presentation/components/FrameworkList.jsx \
  client/src/presentation/styles/global.css
git commit -m "feat(client): consulta y muestra los marcos normativos disponibles"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/App.jsx` |
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| nuevo | `client/src/domain/localize.js` |
| nuevo | `client/src/infrastructure/api/frameworksApi.js` |
| nuevo | `client/src/presentation/components/FrameworkList.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-2/catalogos-normativos -m "Merge branch 'fase-2/catalogos-normativos' into main"
```
Commit de merge: `16eb819`

## Fase 3: Flujo de auditoría: información general con datos automáticos, procesos, selección de criterios y revisión punto a punto

Rama: `fase-3/flujo-auditoria`

```bash
git checkout main
git checkout -b fase-3/flujo-auditoria
```

#### `0bd3f4e` feat(domain): modelo de auditoría, procesos y puntos auditables

```bash
git add client/src/domain/audit.js
git commit -m "feat(domain): modelo de auditoría, procesos y puntos auditables"
```

| Estado | Archivo |
|---|---|
| nuevo | `client/src/domain/audit.js` |

#### `f46102b` feat(infra): autoguardado local, huella del dispositivo, geolocalización con permiso y hora del servidor

```bash
git add client/src/infrastructure/api/systemApi.js \
  client/src/infrastructure/crypto/hash.js \
  client/src/infrastructure/device/deviceInfo.js \
  client/src/infrastructure/device/geolocation.js \
  client/src/infrastructure/storage/auditStorage.js
git commit -m "feat(infra): autoguardado local, huella del dispositivo, geolocalización con permiso y hora del servidor"
```

| Estado | Archivo |
|---|---|
| nuevo | `client/src/infrastructure/api/systemApi.js` |
| nuevo | `client/src/infrastructure/crypto/hash.js` |
| nuevo | `client/src/infrastructure/device/deviceInfo.js` |
| nuevo | `client/src/infrastructure/device/geolocation.js` |
| nuevo | `client/src/infrastructure/storage/auditStorage.js` |

#### `ef88168` feat(app): estado de la auditoría con bitácora de eventos y navegación por vistas

```bash
git add client/src/application/audit/AuditContext.jsx \
  client/src/application/navigation/NavContext.jsx \
  client/src/main.jsx
git commit -m "feat(app): estado de la auditoría con bitácora de eventos y navegación por vistas"
```

| Estado | Archivo |
|---|---|
| nuevo | `client/src/application/audit/AuditContext.jsx` |
| nuevo | `client/src/application/navigation/NavContext.jsx` |
| modificado | `client/src/main.jsx` |

#### `a8649c3` feat(ui): flujo de auditoría (información general, procesos, criterios, lista y revisión punto a punto con guía)

```bash
git add client/src/App.jsx \
  client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/presentation/components/AppHeader.jsx \
  client/src/presentation/components/DeviceSummary.jsx \
  client/src/presentation/components/GuidanceModal.jsx \
  client/src/presentation/components/ui.jsx \
  client/src/presentation/pages/ChecklistPage.jsx \
  client/src/presentation/pages/CriteriaPage.jsx \
  client/src/presentation/pages/DashboardPage.jsx \
  client/src/presentation/pages/GeneralPage.jsx \
  client/src/presentation/pages/HomePage.jsx \
  client/src/presentation/pages/ItemAuditPage.jsx \
  client/src/presentation/pages/ProcessFormPage.jsx \
  client/src/presentation/styles/global.css
git commit -m "feat(ui): flujo de auditoría (información general, procesos, criterios, lista y revisión punto a punto con guía)"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/App.jsx` |
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| modificado | `client/src/presentation/components/AppHeader.jsx` |
| nuevo | `client/src/presentation/components/DeviceSummary.jsx` |
| nuevo | `client/src/presentation/components/GuidanceModal.jsx` |
| nuevo | `client/src/presentation/components/ui.jsx` |
| nuevo | `client/src/presentation/pages/ChecklistPage.jsx` |
| nuevo | `client/src/presentation/pages/CriteriaPage.jsx` |
| nuevo | `client/src/presentation/pages/DashboardPage.jsx` |
| nuevo | `client/src/presentation/pages/GeneralPage.jsx` |
| modificado | `client/src/presentation/pages/HomePage.jsx` |
| nuevo | `client/src/presentation/pages/ItemAuditPage.jsx` |
| nuevo | `client/src/presentation/pages/ProcessFormPage.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-3/flujo-auditoria -m "Merge branch 'fase-3/flujo-auditoria' into main"
```
Commit de merge: `cb4453a`

## Fase 4: Hallazgos CCCER, calculadora OWASP Risk Rating, capturas de evidencia y plan de acción

Rama: `fase-4/hallazgos-riesgo`

```bash
git checkout main
git checkout -b fase-4/hallazgos-riesgo
```

#### `121d388` feat(shared): metodología OWASP Risk Rating compartida entre cliente y servidor, con pruebas

```bash
git add Dockerfile \
  server/test/riskRating.test.js \
  shared/riskRating.js
git commit -m "feat(shared): metodología OWASP Risk Rating compartida entre cliente y servidor, con pruebas"
```

| Estado | Archivo |
|---|---|
| modificado | `Dockerfile` |
| nuevo | `server/test/riskRating.test.js` |
| nuevo | `shared/riskRating.js` |

#### `b9014eb` feat(shared): numeración única de hallazgos (H-01…) y textos multilenguaje compartidos con el servidor

```bash
git add client/src/domain/localize.js \
  shared/findings.js \
  shared/localize.js
git commit -m "feat(shared): numeración única de hallazgos (H-01…) y textos multilenguaje compartidos con el servidor"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/domain/localize.js` |
| nuevo | `shared/findings.js` |
| nuevo | `shared/localize.js` |

#### `0d4cf03` feat(infra): evidencias en IndexedDB con compresión de imágenes y huella SHA-256

```bash
git add client/src/infrastructure/media/imageCompressor.js \
  client/src/infrastructure/storage/evidenceStore.js
git commit -m "feat(infra): evidencias en IndexedDB con compresión de imágenes y huella SHA-256"
```

| Estado | Archivo |
|---|---|
| nuevo | `client/src/infrastructure/media/imageCompressor.js` |
| nuevo | `client/src/infrastructure/storage/evidenceStore.js` |

#### `3fb4b51` feat(ui): hallazgos CCCER, calculadora OWASP Risk Rating, capturas y plan de acción con interpretación

```bash
git add client/src/App.jsx \
  client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/presentation/components/FindingForm.jsx \
  client/src/presentation/components/ImageEvidence.jsx \
  client/src/presentation/components/RiskCalculator.jsx \
  client/src/presentation/components/ui.jsx \
  client/src/presentation/pages/ActionPlanPage.jsx \
  client/src/presentation/pages/ChecklistPage.jsx \
  client/src/presentation/pages/DashboardPage.jsx \
  client/src/presentation/pages/GeneralPage.jsx \
  client/src/presentation/pages/HomePage.jsx \
  client/src/presentation/pages/ItemAuditPage.jsx \
  client/src/presentation/styles/global.css
git commit -m "feat(ui): hallazgos CCCER, calculadora OWASP Risk Rating, capturas y plan de acción con interpretación"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/App.jsx` |
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| nuevo | `client/src/presentation/components/FindingForm.jsx` |
| nuevo | `client/src/presentation/components/ImageEvidence.jsx` |
| nuevo | `client/src/presentation/components/RiskCalculator.jsx` |
| modificado | `client/src/presentation/components/ui.jsx` |
| nuevo | `client/src/presentation/pages/ActionPlanPage.jsx` |
| modificado | `client/src/presentation/pages/ChecklistPage.jsx` |
| modificado | `client/src/presentation/pages/DashboardPage.jsx` |
| modificado | `client/src/presentation/pages/GeneralPage.jsx` |
| modificado | `client/src/presentation/pages/HomePage.jsx` |
| modificado | `client/src/presentation/pages/ItemAuditPage.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-4/hallazgos-riesgo -m "Merge branch 'fase-4/hallazgos-riesgo' into main"
```
Commit de merge: `82067b0`

## Fase 5: Bitácora íntegra con sellos de tiempo, guardar para continuar y continuar desde archivo

Rama: `fase-5/bitacora-integridad`

```bash
git checkout main
git checkout -b fase-5/bitacora-integridad
```

#### `36e1734` feat(shared): JSON canónico y verificación de bitácora encadenada con sellos de tiempo

```bash
git add shared/canonical.js \
  shared/integrity.js
git commit -m "feat(shared): JSON canónico y verificación de bitácora encadenada con sellos de tiempo"
```

| Estado | Archivo |
|---|---|
| nuevo | `shared/canonical.js` |
| nuevo | `shared/integrity.js` |

#### `0a0454e` feat(server): sellos de tiempo HMAC y verificación de integridad, con pruebas de manipulación

```bash
git add server/src/app.js \
  server/src/application/services/integrityService.js \
  server/src/infrastructure/keys/hmacKeyStore.js \
  server/src/presentation/controllers/integrity.controller.js \
  server/src/presentation/routes/index.js \
  server/test/integrity.test.js
git commit -m "feat(server): sellos de tiempo HMAC y verificación de integridad, con pruebas de manipulación"
```

| Estado | Archivo |
|---|---|
| modificado | `server/src/app.js` |
| nuevo | `server/src/application/services/integrityService.js` |
| nuevo | `server/src/infrastructure/keys/hmacKeyStore.js` |
| nuevo | `server/src/presentation/controllers/integrity.controller.js` |
| modificado | `server/src/presentation/routes/index.js` |
| nuevo | `server/test/integrity.test.js` |

#### `c4c95aa` feat(infra): cliente de sellos e integridad y descarga de archivos

```bash
git add client/src/infrastructure/api/integrityApi.js \
  client/src/infrastructure/files/download.js
git commit -m "feat(infra): cliente de sellos e integridad y descarga de archivos"
```

| Estado | Archivo |
|---|---|
| nuevo | `client/src/infrastructure/api/integrityApi.js` |
| nuevo | `client/src/infrastructure/files/download.js` |

#### `ab4c0a3` feat(app): bitácora encadenada con sellos del servidor, exportar e importar auditorías (.audit.json)

```bash
git add client/src/application/audit/AuditContext.jsx \
  client/src/application/audit/auditFile.js
git commit -m "feat(app): bitácora encadenada con sellos del servidor, exportar e importar auditorías (.audit.json)"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/application/audit/AuditContext.jsx` |
| nuevo | `client/src/application/audit/auditFile.js` |

#### `5c4718e` feat(ui): guardar para continuar, continuar desde archivo con cambio de auditor/dispositivo y verificación de integridad

```bash
git add client/src/App.jsx \
  client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/presentation/components/ImportModal.jsx \
  client/src/presentation/components/IntegrityPanel.jsx \
  client/src/presentation/components/IntegrityReport.jsx \
  client/src/presentation/components/SaveFileButton.jsx \
  client/src/presentation/pages/DashboardPage.jsx \
  client/src/presentation/pages/HomePage.jsx \
  client/src/presentation/styles/global.css
git commit -m "feat(ui): guardar para continuar, continuar desde archivo con cambio de auditor/dispositivo y verificación de integridad"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/App.jsx` |
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| nuevo | `client/src/presentation/components/ImportModal.jsx` |
| nuevo | `client/src/presentation/components/IntegrityPanel.jsx` |
| nuevo | `client/src/presentation/components/IntegrityReport.jsx` |
| nuevo | `client/src/presentation/components/SaveFileButton.jsx` |
| modificado | `client/src/presentation/pages/DashboardPage.jsx` |
| modificado | `client/src/presentation/pages/HomePage.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-5/bitacora-integridad -m "Merge branch 'fase-5/bitacora-integridad' into main"
```
Commit de merge: `1ea7557`

## Fase 6: Informe final en Word y PDF

Rama: `fase-6/informes`

```bash
git checkout main
git checkout -b fase-6/informes
```

#### `06062f6` feat(server): modelo del informe con la estructura del caso, hallazgos, plan, interpretación y anexos (es/en)

```bash
git add server/src/application/reports/buildReportModel.js \
  server/src/application/reports/labels.js
git commit -m "feat(server): modelo del informe con la estructura del caso, hallazgos, plan, interpretación y anexos (es/en)"
```

| Estado | Archivo |
|---|---|
| nuevo | `server/src/application/reports/buildReportModel.js` |
| nuevo | `server/src/application/reports/labels.js` |

#### `d846a1a` feat(server): informes en Word (docx) y PDF (pdfmake) con servicio, ruta y pruebas

```bash
git add server/package-lock.json \
  server/package.json \
  server/src/app.js \
  server/src/application/services/integrityService.js \
  server/src/application/services/reportService.js \
  server/src/infrastructure/reports/docxRenderer.js \
  server/src/infrastructure/reports/pdfRenderer.js \
  server/src/presentation/controllers/reports.controller.js \
  server/src/presentation/routes/index.js \
  server/test/reports.test.js
git commit -m "feat(server): informes en Word (docx) y PDF (pdfmake) con servicio, ruta y pruebas"
```

| Estado | Archivo |
|---|---|
| modificado | `server/package-lock.json` |
| modificado | `server/package.json` |
| modificado | `server/src/app.js` |
| modificado | `server/src/application/services/integrityService.js` |
| nuevo | `server/src/application/services/reportService.js` |
| nuevo | `server/src/infrastructure/reports/docxRenderer.js` |
| nuevo | `server/src/infrastructure/reports/pdfRenderer.js` |
| nuevo | `server/src/presentation/controllers/reports.controller.js` |
| modificado | `server/src/presentation/routes/index.js` |
| nuevo | `server/test/reports.test.js` |

#### `8710cc2` feat(ui): página de informe final con interpretación general, verificación y descargas

```bash
git add client/src/App.jsx \
  client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/infrastructure/api/reportsApi.js \
  client/src/presentation/pages/DashboardPage.jsx \
  client/src/presentation/pages/ReportPage.jsx \
  client/src/presentation/styles/global.css
git commit -m "feat(ui): página de informe final con interpretación general, verificación y descargas"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/App.jsx` |
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| nuevo | `client/src/infrastructure/api/reportsApi.js` |
| modificado | `client/src/presentation/pages/DashboardPage.jsx` |
| nuevo | `client/src/presentation/pages/ReportPage.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-6/informes -m "Merge branch 'fase-6/informes' into main"
```
Commit de merge: `5d12e7e`

## Fase 7: Pruebas de integración, documentación y guía de fases

Rama: `fase-7/pruebas-documentacion`

```bash
git checkout main
git checkout -b fase-7/pruebas-documentacion
```

#### `dbccc77` test(server): pruebas de integración de la API y mensaje genérico ante JSON malformado

```bash
git add server/src/presentation/middlewares/errorHandler.js \
  server/test/api.test.js
git commit -m "test(server): pruebas de integración de la API y mensaje genérico ante JSON malformado"
```

| Estado | Archivo |
|---|---|
| modificado | `server/src/presentation/middlewares/errorHandler.js` |
| nuevo | `server/test/api.test.js` |

#### `2bcc73a` docs: README con instalación, arquitectura por capas, integridad, datos personales y limitaciones

```bash
git add README.md
git commit -m "docs: README con instalación, arquitectura por capas, integridad, datos personales y limitaciones"
```

| Estado | Archivo |
|---|---|
| modificado | `README.md` |

#### `1c81811` docs: guía de fases con ramas, commits y merges

```bash
git add docs/FASES.md
git commit -m "docs: guía de fases con ramas, commits y merges"
```

| Estado | Archivo |
|---|---|
| nuevo | `docs/FASES.md` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-7/pruebas-documentacion -m "Merge branch 'fase-7/pruebas-documentacion' into main"
```
Commit de merge: `33fce35`

## Fase 8: Ajustes de interfaz: scroll y filtro de elegidos en criterios, píldoras de estado y diseño para celular

Rama: `fase-8/ajustes-interfaz-responsive`

```bash
git checkout main
git checkout -b fase-8/ajustes-interfaz-responsive
```

#### `46e9884` feat(ui): lista de criterios con scroll interno, filtro «Solo elegidos» y píldoras de estado en una sola línea

```bash
git add client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/presentation/pages/CriteriaPage.jsx \
  client/src/presentation/styles/global.css
git commit -m "feat(ui): lista de criterios con scroll interno, filtro «Solo elegidos» y píldoras de estado en una sola línea"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| modificado | `client/src/presentation/pages/CriteriaPage.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

#### `6984ecc` feat(ui): diseño responsive para celular (encabezado compacto, pestañas deslizables, tabla y formularios adaptados)

```bash
git add client/src/presentation/components/AppHeader.jsx \
  client/src/presentation/components/SaveFileButton.jsx \
  client/src/presentation/pages/ChecklistPage.jsx \
  client/src/presentation/styles/global.css
git commit -m "feat(ui): diseño responsive para celular (encabezado compacto, pestañas deslizables, tabla y formularios adaptados)"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/presentation/components/AppHeader.jsx` |
| modificado | `client/src/presentation/components/SaveFileButton.jsx` |
| modificado | `client/src/presentation/pages/ChecklistPage.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

#### `924cad8` docs: agrega la fase 8 a la guía de fases

```bash
git add docs/FASES.md
git commit -m "docs: agrega la fase 8 a la guía de fases"
```

| Estado | Archivo |
|---|---|
| modificado | `docs/FASES.md` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-8/ajustes-interfaz-responsive -m "Merge branch 'fase-8/ajustes-interfaz-responsive' into main"
```
Commit de merge: `312cb3b`

## Fase 9: Rediseño con la identidad de la UDES: paleta azul y oro, tipografías, sello y pie de página

Rama: `fase-9/rediseno-udes`

```bash
git checkout main
git checkout -b fase-9/rediseno-udes
```

#### `222ef9f` style(ui): paleta de referencia UDES (azul y oro), tipografías Bitter y Atkinson Hyperlegible servidas localmente

```bash
git add client/package-lock.json \
  client/package.json \
  client/src/main.jsx \
  client/src/presentation/styles/global.css
git commit -m "style(ui): paleta de referencia UDES (azul y oro), tipografías Bitter y Atkinson Hyperlegible servidas localmente"
```

| Estado | Archivo |
|---|---|
| modificado | `client/package-lock.json` |
| modificado | `client/package.json` |
| modificado | `client/src/main.jsx` |
| modificado | `client/src/presentation/styles/global.css` |

#### `3778159` feat(ui): sello dorado como marca en el encabezado, la portada y la verificación de integridad

```bash
git add client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/presentation/components/AppHeader.jsx \
  client/src/presentation/components/IntegrityReport.jsx \
  client/src/presentation/components/Seal.jsx \
  client/src/presentation/pages/HomePage.jsx
git commit -m "feat(ui): sello dorado como marca en el encabezado, la portada y la verificación de integridad"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| modificado | `client/src/presentation/components/AppHeader.jsx` |
| modificado | `client/src/presentation/components/IntegrityReport.jsx` |
| nuevo | `client/src/presentation/components/Seal.jsx` |
| modificado | `client/src/presentation/pages/HomePage.jsx` |

#### `95d5db9` feat(ui): pie de página con el crédito de la asignatura Auditoría de Software, UDES 2026

```bash
git add client/src/App.jsx \
  client/src/application/i18n/locales/en.js \
  client/src/application/i18n/locales/es.js \
  client/src/presentation/components/AppFooter.jsx
git commit -m "feat(ui): pie de página con el crédito de la asignatura Auditoría de Software, UDES 2026"
```

| Estado | Archivo |
|---|---|
| modificado | `client/src/App.jsx` |
| modificado | `client/src/application/i18n/locales/en.js` |
| modificado | `client/src/application/i18n/locales/es.js` |
| nuevo | `client/src/presentation/components/AppFooter.jsx` |

#### docs: guía de fases con ramas, commits y merges

```bash
git add docs/FASES.md
git commit -m "docs: guía de fases con ramas, commits y merges"
```

| Estado | Archivo |
|---|---|
| nuevo | `docs/FASES.md` (este archivo) |

#### fix(ui): encabezado y pie siempre visibles (solo se desplaza el contenido) y sello como ícono de la pestaña

```bash
git add client/index.html \
  client/public/favicon.svg \
  client/src/application/navigation/NavContext.jsx \
  client/src/presentation/styles/global.css \
  docs/FASES.md
git commit -m "fix(ui): encabezado y pie siempre visibles (solo se desplaza el contenido) y sello como ícono de la pestaña"
```

| Estado | Archivo |
|---|---|
| modificado | `client/index.html` |
| nuevo | `client/public/favicon.svg` |
| modificado | `client/src/application/navigation/NavContext.jsx` |
| modificado | `client/src/presentation/styles/global.css` |
| modificado | `docs/FASES.md` |

Merge a `main`:

```bash
git checkout main
git merge --no-ff fase-9/rediseno-udes -m "Merge branch 'fase-9/rediseno-udes' into main"
```

