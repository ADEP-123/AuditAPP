import { useI18n } from '../../application/i18n/I18nContext.jsx';
import { Field } from './ui.jsx';
import RiskCalculator from './RiskCalculator.jsx';

// Hallazgo con la estructura criterio, condición, causa, efecto y recomendación (CCCER).
export default function FindingForm({ finding, onChange }) {
  const { t } = useI18n();
  const set = (k) => (e) => onChange({ ...finding, [k]: e.target.value });

  return (
    <section className="card finding">
      <h2>{t('finding.title')}</h2>
      <p className="small muted">{t('finding.help')}</p>
      <Field label={t('finding.name')} required><input value={finding.title} onChange={set('title')} /></Field>
      <Field label={t('finding.criterion')} hint={t('finding.criterionHint')}><textarea rows={2} value={finding.criterion} onChange={set('criterion')} /></Field>
      <Field label={t('finding.condition')} required hint={t('finding.conditionHint')}><textarea rows={3} value={finding.condition} onChange={set('condition')} /></Field>
      <Field label={t('finding.cause')} hint={t('finding.causeHint')}><textarea rows={2} value={finding.cause} onChange={set('cause')} /></Field>
      <Field label={t('finding.effect')} hint={t('finding.effectHint')}><textarea rows={2} value={finding.effect} onChange={set('effect')} /></Field>
      <Field label={t('finding.recommendation')}><textarea rows={2} value={finding.recommendation} onChange={set('recommendation')} /></Field>
      <h3>{t('risk.title')}</h3>
      <RiskCalculator value={finding.risk} onChange={(risk) => onChange({ ...finding, risk })} />
    </section>
  );
}
