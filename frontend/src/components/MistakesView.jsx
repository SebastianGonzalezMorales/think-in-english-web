import { phraseBank } from '../data/phraseBank';
import { useStats } from '../hooks/useStats';

export default function MistakesView({ onStartReview }) {
  const { stats, clearMistakes } = useStats();

  const items = stats.mistakes
    .map((m) => ({ ...m, phrase: phraseBank.find((p) => p.id === m.id) }))
    .filter((m) => m.phrase);

  const handleStartReview = () => {
    onStartReview(items.map((m) => m.id));
  };

  return (
    <div className="card mistakes-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">REPETICIÓN INTELIGENTE</p>
          <h3>Frases que necesitan refuerzo</h3>
        </div>
        {items.length > 0 && (
          <button className="btn-text" onClick={clearMistakes}>
            Limpiar historial
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-list">
          Aún no tienes frases pendientes. Las respuestas incorrectas aparecerán aquí para que
          puedas repasarlas.
        </div>
      ) : (
        <>
          {/* ── Review button ── */}
          <button className="btn-primary btn-review" onClick={handleStartReview}>
            ↺ Repasar todas ({items.length} frases)
          </button>

          <div className="mistakes-list">
            {items.map((item) => (
              <article key={item.id} className="mistake-item">
                <div className="mistake-header">
                  <h4>{item.phrase.es}</h4>
                  <span className="attempts-badge">
                    {item.attempts} {item.attempts === 1 ? 'intento' : 'intentos'}
                  </span>
                </div>
                <p><strong>Tu última respuesta:</strong> {item.lastAnswer}</p>
                <p><strong>Respuesta sugerida:</strong> {item.phrase.answers[0]}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
