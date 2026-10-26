// Metodología OWASP Risk Rating: riesgo = probabilidad × impacto.
// Lógica pura compartida por el cliente (calculadora) y el servidor (informe).
// Fuente: https://owasp.org/www-community/OWASP_Risk_Rating_Methodology

const o = (value, es, en) => ({ value, label: { es, en } });

export const FACTOR_GROUPS = [
  {
    id: 'threatAgent', part: 'likelihood', name: { es: 'Agente de amenaza', en: 'Threat agent' },
    factors: [
      { id: 'skill', name: { es: 'Nivel de habilidad', en: 'Skill level' }, options: [
        o(1, 'Sin conocimientos técnicos', 'No technical skills'), o(3, 'Algunos conocimientos técnicos', 'Some technical skills'),
        o(5, 'Usuario avanzado de computadores', 'Advanced computer user'), o(6, 'Conocimientos de redes y programación', 'Network and programming skills'),
        o(9, 'Habilidades de pruebas de penetración', 'Security penetration skills')] },
      { id: 'motive', name: { es: 'Motivación', en: 'Motive' }, options: [
        o(1, 'Recompensa baja o nula', 'Low or no reward'), o(4, 'Recompensa posible', 'Possible reward'), o(9, 'Recompensa alta', 'High reward')] },
      { id: 'opportunity', name: { es: 'Oportunidad', en: 'Opportunity' }, options: [
        o(0, 'Requiere acceso total o recursos costosos', 'Full access or expensive resources required'),
        o(4, 'Requiere acceso o recursos especiales', 'Special access or resources required'),
        o(7, 'Requiere algo de acceso o recursos', 'Some access or resources required'), o(9, 'No requiere acceso ni recursos', 'No access or resources required')] },
      { id: 'size', name: { es: 'Tamaño del grupo', en: 'Size' }, options: [
        o(2, 'Desarrolladores', 'Developers'), o(2, 'Administradores de sistemas', 'System administrators'), o(4, 'Usuarios de la intranet', 'Intranet users'),
        o(5, 'Socios', 'Partners'), o(6, 'Usuarios autenticados', 'Authenticated users'), o(9, 'Usuarios anónimos de Internet', 'Anonymous Internet users')] },
    ],
  },
  {
    id: 'vulnerability', part: 'likelihood', name: { es: 'Vulnerabilidad', en: 'Vulnerability' },
    factors: [
      { id: 'discovery', name: { es: 'Facilidad de descubrimiento', en: 'Ease of discovery' }, options: [
        o(1, 'Prácticamente imposible', 'Practically impossible'), o(3, 'Difícil', 'Difficult'), o(7, 'Fácil', 'Easy'), o(9, 'Hay herramientas automáticas', 'Automated tools available')] },
      { id: 'exploit', name: { es: 'Facilidad de explotación', en: 'Ease of exploit' }, options: [
        o(1, 'Teórica', 'Theoretical'), o(3, 'Difícil', 'Difficult'), o(5, 'Fácil', 'Easy'), o(9, 'Hay herramientas automáticas', 'Automated tools available')] },
      { id: 'awareness', name: { es: 'Conocimiento público', en: 'Awareness' }, options: [
        o(1, 'Desconocida', 'Unknown'), o(4, 'Oculta', 'Hidden'), o(6, 'Evidente', 'Obvious'), o(9, 'De conocimiento público', 'Public knowledge')] },
      { id: 'detection', name: { es: 'Detección de intrusiones', en: 'Intrusion detection' }, options: [
        o(1, 'Detección activa en la aplicación', 'Active detection in application'), o(3, 'Se registra y se revisa', 'Logged and reviewed'),
        o(8, 'Se registra sin revisión', 'Logged without review'), o(9, 'No se registra', 'Not logged')] },
    ],
  },
  {
    id: 'technical', part: 'impact', name: { es: 'Impacto técnico', en: 'Technical impact' },
    factors: [
      { id: 'confidentiality', name: { es: 'Pérdida de confidencialidad', en: 'Loss of confidentiality' }, options: [
        o(2, 'Poca información no sensible expuesta', 'Minimal non-sensitive data disclosed'), o(6, 'Poca información crítica expuesta', 'Minimal critical data disclosed'),
        o(6, 'Mucha información no sensible expuesta', 'Extensive non-sensitive data disclosed'), o(7, 'Mucha información crítica expuesta', 'Extensive critical data disclosed'),
        o(9, 'Toda la información expuesta', 'All data disclosed')] },
      { id: 'integrity', name: { es: 'Pérdida de integridad', en: 'Loss of integrity' }, options: [
        o(1, 'Pocos datos levemente corruptos', 'Minimal slightly corrupt data'), o(3, 'Pocos datos gravemente corruptos', 'Minimal seriously corrupt data'),
        o(5, 'Muchos datos levemente corruptos', 'Extensive slightly corrupt data'), o(7, 'Muchos datos gravemente corruptos', 'Extensive seriously corrupt data'),
        o(9, 'Todos los datos totalmente corruptos', 'All data totally corrupt')] },
      { id: 'availability', name: { es: 'Pérdida de disponibilidad', en: 'Loss of availability' }, options: [
        o(1, 'Pocos servicios secundarios interrumpidos', 'Minimal secondary services interrupted'), o(5, 'Pocos servicios principales interrumpidos', 'Minimal primary services interrupted'),
        o(5, 'Muchos servicios secundarios interrumpidos', 'Extensive secondary services interrupted'), o(7, 'Muchos servicios principales interrumpidos', 'Extensive primary services interrupted'),
        o(9, 'Todos los servicios perdidos', 'All services completely lost')] },
      { id: 'accountability', name: { es: 'Pérdida de trazabilidad', en: 'Loss of accountability' }, options: [
        o(1, 'Totalmente rastreable', 'Fully traceable'), o(7, 'Posiblemente rastreable', 'Possibly traceable'), o(9, 'Completamente anónimo', 'Completely anonymous')] },
    ],
  },
  {
    id: 'business', part: 'impact', name: { es: 'Impacto en el negocio', en: 'Business impact' },
    factors: [
      { id: 'financial', name: { es: 'Daño financiero', en: 'Financial damage' }, options: [
        o(1, 'Menor que el costo de corregir la vulnerabilidad', 'Less than the cost to fix the vulnerability'), o(3, 'Efecto menor en la utilidad anual', 'Minor effect on annual profit'),
        o(7, 'Efecto significativo en la utilidad anual', 'Significant effect on annual profit'), o(9, 'Quiebra', 'Bankruptcy')] },
      { id: 'reputation', name: { es: 'Daño reputacional', en: 'Reputation damage' }, options: [
        o(1, 'Daño mínimo', 'Minimal damage'), o(4, 'Pérdida de cuentas importantes', 'Loss of major accounts'), o(5, 'Pérdida de buena voluntad', 'Loss of goodwill'), o(9, 'Daño a la marca', 'Brand damage')] },
      { id: 'compliance', name: { es: 'Incumplimiento normativo', en: 'Non-compliance' }, options: [
        o(2, 'Incumplimiento menor', 'Minor violation'), o(5, 'Incumplimiento claro', 'Clear violation'), o(7, 'Incumplimiento de alto perfil', 'High profile violation')] },
      { id: 'privacy', name: { es: 'Violación de privacidad', en: 'Privacy violation' }, options: [
        o(3, 'Una persona', 'One individual'), o(5, 'Cientos de personas', 'Hundreds of people'), o(7, 'Miles de personas', 'Thousands of people'), o(9, 'Millones de personas', 'Millions of people')] },
    ],
  },
];

export const SEVERITY_ORDER = ['note', 'low', 'medium', 'high', 'critical'];

// SEVERITY_MATRIX[nivelDeImpacto][nivelDeProbabilidad]
const SEVERITY_MATRIX = {
  low: { low: 'note', medium: 'low', high: 'medium' },
  medium: { low: 'low', medium: 'medium', high: 'high' },
  high: { low: 'medium', medium: 'high', high: 'critical' },
};

export const levelOf = (score) => (score < 3 ? 'low' : score < 6 ? 'medium' : 'high');
export const severityOf = (impactLevel, likelihoodLevel) => SEVERITY_MATRIX[impactLevel][likelihoodLevel];

const round2 = (x) => Math.round(x * 100) / 100;

// Promedio de los factores calificados (selection guarda el índice de la opción elegida).
function average(groups, selection) {
  const scores = groups
    .flatMap((g) => g.factors)
    .filter((f) => f.options[selection?.[f.id]])
    .map((f) => f.options[selection[f.id]].value);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}
const groupsOf = (...ids) => FACTOR_GROUPS.filter((g) => ids.includes(g.id));

/**
 * selection: { skill: índiceDeOpción, motive: …, … } (16 factores, algunos pueden faltar).
 * Devuelve null si no hay datos suficientes para probabilidad o impacto.
 * El impacto usa el de negocio si se calificó; si no, el técnico (como indica la metodología).
 */
export function rateRisk(selection) {
  const likelihoodScore = average(groupsOf('threatAgent', 'vulnerability'), selection);
  const tech = average(groupsOf('technical'), selection);
  const biz = average(groupsOf('business'), selection);
  const impactScore = biz ?? tech;
  if (likelihoodScore === null || impactScore === null) return null;
  const likelihood = { score: round2(likelihoodScore), level: levelOf(likelihoodScore) };
  const impact = { score: round2(impactScore), level: levelOf(impactScore), basis: biz !== null ? 'business' : 'technical' };
  return { likelihood, impact, severity: severityOf(impact.level, likelihood.level) };
}

export const SEVERITY_LABEL = {
  note: { es: 'Nota', en: 'Note' },
  low: { es: 'Baja', en: 'Low' },
  medium: { es: 'Media', en: 'Medium' },
  high: { es: 'Alta', en: 'High' },
  critical: { es: 'Crítica', en: 'Critical' },
};
