import { CATEGORIES } from '../data/phraseBank';
import { useStats } from '../hooks/useStats';

export default function ProgressView() {
  const { stats } = useStats();

  const accuracy = stats.answered
    ? Math.round((stats.correct / stats.answered) * 100)
    : 0;

  const entries = Object.entries(stats.categories);
  let bestCategory = '—';
  if (entries.length) {
    bestCategory = entries
      .sort((a, b) => b[1].correct / b[1].answered - a[1].correct / a[1].answered)[0][0];
  }

  return (
    <div>
      {/* ── Metric cards ── */}
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Precisión general</span>
          <strong>{accuracy}%</strong>
          <small>Según tus respuestas revisadas</small>
        </article>
        <article className="metric-card">
          <span>Frases respondidas</span>
          <strong>{stats.answered}</strong>
          <small>Total acumulado</small>
        </article>
        <article className="metric-card">
          <span>Mejor categoría</span>
          <strong style={{ fontSize: bestCategory.length > 10 ? '20px' : undefined }}>
            {bestCategory}
          </strong>
          <small>Mayor precisión registrada</small>
        </article>
      </div>

      {/* ── Category breakdown ── */}
      <div className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RESUMEN</p>
            <h3>Rendimiento por categoría</h3>
          </div>
        </div>
        <div className="category-progress">
          {CATEGORIES.map((cat) => {
            const data = stats.categories[cat] || { answered: 0, correct: 0 };
            const pct  = data.answered ? Math.round((data.correct / data.answered) * 100) : 0;
            return (
              <div key={cat}>
                <div className="progress-row-header">
                  <span>{cat}</span>
                  <span>{pct}%</span>
                </div>
                <div className="progress-row-track">
                  <div className="progress-row-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
