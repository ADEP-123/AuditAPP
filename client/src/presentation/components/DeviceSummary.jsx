import { useI18n } from '../../application/i18n/I18nContext.jsx';

export default function DeviceSummary({ device, ip }) {
  const { t } = useI18n();
  if (!device) return <p className="muted small">…</p>;
  const i = device.info;
  return (
    <dl className="kv small">
      <dt>{t('device.id')}</dt><dd><code>{device.id}</code></dd>
      <dt>{t('device.browser')}</dt><dd>{i.browser || i.userAgent}</dd>
      <dt>{t('device.platform')}</dt><dd>{[i.platform, i.platformVersion, i.architecture].filter(Boolean).join(' ')}</dd>
      <dt>{t('device.timezone')}</dt><dd>{i.timeZone} · {i.language}</dd>
      <dt>{t('device.screen')}</dt><dd>{i.screen}{i.cores ? ` · ${i.cores} CPU` : ''}{i.memoryGb ? ` · ${i.memoryGb} GB` : ''}</dd>
      {ip && (<><dt>IP</dt><dd>{ip}</dd></>)}
    </dl>
  );
}
