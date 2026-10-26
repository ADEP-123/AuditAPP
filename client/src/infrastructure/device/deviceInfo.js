import { sha256Hex } from '../crypto/hash.js';

// Un navegador no puede leer el nombre del equipo, la MAC ni el usuario del sistema.
// Se registra lo que sí expone y se resume en una huella para detectar cambios de equipo.
export async function collectDeviceInfo() {
  const nav = navigator;
  const info = {
    userAgent: nav.userAgent,
    platform: nav.userAgentData?.platform || nav.platform || '',
    language: nav.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}x${screen.height}@${window.devicePixelRatio || 1}`,
    cores: nav.hardwareConcurrency ?? null,
    memoryGb: nav.deviceMemory ?? null,
  };
  if (nav.userAgentData?.getHighEntropyValues) {
    try {
      const hi = await nav.userAgentData.getHighEntropyValues(['platformVersion', 'architecture', 'model', 'fullVersionList']);
      info.platformVersion = hi.platformVersion;
      info.architecture = hi.architecture;
      info.model = hi.model || undefined;
      info.browser = hi.fullVersionList?.filter((b) => !/Not.?A.?Brand/i.test(b.brand)).map((b) => `${b.brand} ${b.version}`).join(', ');
    } catch {
      /* el navegador puede negar estos datos */
    }
  }
  const stable = [info.userAgent, info.platform, info.timeZone, info.screen, info.cores, info.memoryGb].join('|');
  const id = (await sha256Hex(stable)).slice(0, 16);
  return { id, info };
}
