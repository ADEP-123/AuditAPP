// Texto multilenguaje { es, en } -> texto en el idioma pedido, con respaldo.
export function loc(value, lang) {
  if (value == null || typeof value === 'string') return value ?? '';
  return value[lang] ?? value.en ?? value.es ?? Object.values(value)[0] ?? '';
}
