import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { FACTOR_GROUPS, rateRisk } from '../../../../shared/riskRating.js';
import { loc } from '../../domain/localize.js';
import { SeverityBadge } from './ui.jsx';

// Calculadora OWASP Risk Rating: 16 factores -> probabilidad, impacto y severidad.
export default function RiskCalculator({ value = {}, onChange }) {
  const { t, lang } = useI18n();
  const rating = rateRisk(value);
  const set = (id, idx) => {
    const next = { ...value };
    if (idx === '') delete next[id];
    else next[id] = Number(idx);
    onChange(next);
  };

  return (
    <div className="risk">
      <p className="small muted">{t('risk.help')}</p>
      <div className="risk-groups">
        {FACTOR_GROUPS.map((g) => (
          <fieldset key={g.id} className="risk-group">
            <legend>{loc(g.name, lang)} <span className="muted small">· {t(`risk.part.${g.part}`)}</span></legend>
            {g.factors.map((f) => (
              <label key={f.id} className="risk-factor">
                <span>{loc(f.name, lang)}</span>
                <select value={value[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value)}>
                  <option value="">—</option>
                  {f.options.map((opt, i) => (
                    <option key={i} value={i}>{opt.value} · {loc(opt.label, lang)}</option>
                  ))}
                </select>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <div className="risk-result" aria-live="polite">
        {rating ? (
          <>
            <span>{t('risk.likelihood')}: <strong>{rating.likelihood.score}</strong> ({t(`level.${rating.likelihood.level}`)})</span>
            <span>
              {t('risk.impact')}: <strong>{rating.impact.score}</strong> ({t(`level.${rating.impact.level}`)}, {t(`risk.basis.${rating.impact.basis}`)})
            </span>
            <SeverityBadge severity={rating.severity} />
          </>
        ) : (
          <span className="muted">{t('risk.incomplete')}</span>
        )}
      </div>
    </div>
  );
}
