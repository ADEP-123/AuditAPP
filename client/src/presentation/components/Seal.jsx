import { useId } from 'react';

// Sello dorado: marca de la app y símbolo de la bitácora sellada.
// Con `text` dibuja el anillo con leyenda (portada); sin texto, la versión compacta (encabezado).
export default function Seal({ size = 40, text, className = '' }) {
  const id = useId();
  return (
    <svg className={`seal ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="57" className="seal-ring" />
      <circle cx="60" cy="60" r={text ? 38 : 47} className="seal-inner" />
      {text && (
        <>
          <defs>
            <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          </defs>
          <text className="seal-text">
            <textPath href={`#${id}`} startOffset="0" textLength="276" lengthAdjust="spacing">{text}</textPath>
          </text>
        </>
      )}
      <path d="M41 61 l13 13 l26 -28" className="seal-check" />
    </svg>
  );
}
