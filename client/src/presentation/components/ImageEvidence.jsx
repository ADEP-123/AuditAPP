import { useEffect, useState } from 'react';
import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { evidenceStore } from '../../infrastructure/storage/evidenceStore.js';
import { compressImage } from '../../infrastructure/media/imageCompressor.js';
import { sha256Hex } from '../../infrastructure/crypto/hash.js';
import { uid } from '../../domain/audit.js';

function Thumb({ id, alt }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    evidenceStore.get(id).then((r) => setSrc(r?.dataUrl ?? null), () => setSrc(null));
  }, [id]);
  return src ? <img src={src} alt={alt} /> : <span className="thumb-missing">?</span>;
}

// Capturas de evidencia: la imagen va a IndexedDB; el ítem guarda solo metadatos y su SHA-256.
export default function ImageEvidence({ images, onChange }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const add = async (files) => {
    setBusy(true);
    setError('');
    try {
      const added = [];
      for (const file of files) {
        const img = await compressImage(file);
        const id = uid();
        await evidenceStore.put({ id, dataUrl: img.dataUrl });
        added.push({ id, name: file.name, type: img.type, size: img.size, width: img.width, height: img.height, sha256: await sha256Hex(img.bytes), caption: '' });
      }
      onChange([...images, ...added]);
    } catch (e) {
      setError(t('images.error', { msg: e.message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="thumbs">
        {images.map((im) => (
          <figure key={im.id} className="thumb">
            <Thumb id={im.id} alt={im.caption || im.name} />
            <input value={im.caption} placeholder={t('images.caption')} onChange={(e) => onChange(images.map((x) => (x.id === im.id ? { ...x, caption: e.target.value } : x)))} />
            <figcaption className="small muted" title={im.sha256}>{Math.round(im.size / 1024)} KB · SHA-256 {im.sha256.slice(0, 10)}…</figcaption>
            <button type="button" className="btn ghost small" onClick={() => onChange(images.filter((x) => x.id !== im.id))}>{t('common.remove')}</button>
          </figure>
        ))}
      </div>
      <label className="btn ghost small file-btn">
        📷 {busy ? t('images.processing') : t('images.add')}
        <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => { add([...e.target.files]); e.target.value = ''; }} />
      </label>
      {error && <p className="badge danger">{error}</p>}
    </div>
  );
}
