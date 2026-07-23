import { phraseBank } from '../data/phraseBank';
import { useStats } from '../hooks/useStats';

export default function MistakesView() {
  const { stats, clearMistakes } = useStats();

  const items = stats.mistakes
    .map((m) => ({ ...m, phrase: phraseBank.find((p) => p.id === m.id) }))
    .filter((m) => m.phrase);

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
          Aún no tienes frases pendientes. Las respuestas incorrectas aparecerán aquí para que puedas repasarlas.
        </div>
      ) : (
        <div className="mistakes-list">
          {items.map((item) => (
            <article key={item.id} className="mistake-item">
              <h4>{item.phrase.es}</h4>
              <p><strong>Tu última respuesta:</strong> {item.lastAnswer}</p>
              <p><strong>Respuesta sugerida:</strong> {item.phrase.answers[0]}</p>
              <p><strong>Intentos con dificultad:</strong> {item.attempts}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
