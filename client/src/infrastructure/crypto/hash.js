// SHA-256 con Web Crypto. Solo existe en contextos seguros (https o localhost).
export async function sha256Hex(data) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto no disponible: abre la app en https o en http://localhost');
  }
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
