# Catálogos de marcos normativos

| Archivo | Fuente | Licencia |
|---|---|---|
| `asvs-5.0.json` | OWASP Application Security Verification Standard 5.0.0 (CSV oficial, 345 requisitos). Texto de requisitos en inglés, sin modificar. | CC BY-SA 4.0 — © OWASP Foundation. https://asvs.owasp.org/ |
| `owasp-top10-2025.json` | OWASP Top 10:2025. Nombres de las categorías; descripciones y guías redactadas por el equipo. | CC BY-SA 4.0 (contenido OWASP) |
| `iso27001-2022.json` | ISO/IEC 27001:2022, Anexo A. Solo número y nombre de los 93 controles (traducción propia al español). | El texto de la norma tiene derechos de autor y no se incluye. |

Las guías (`guidance`) de "cómo auditar" son redacción propia del equipo y referencian
categorías de la OWASP Web Security Testing Guide (WSTG) v4.2.

Formato común: `groups` (capítulos o temas), `items` (puntos auditables) y `guidance`
(guía por grupo o por punto; un ítem usa `guidanceKey` si existe, si no la de su grupo).
