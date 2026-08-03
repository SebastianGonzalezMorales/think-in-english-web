import { useMemo, useState } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';

export default function VocabularyView({ itemType = 'word' }) {
  const vocabulary = useVocabulary();
  const words = itemType === 'phrase' ? vocabulary.phrases : vocabulary.words;
  const { loading, error, addWord, removeWord } = vocabulary;
  const isPhrase = itemType === 'phrase';
  const singular = isPhrase ? 'frase' : 'palabra';
  const plural = isPhrase ? 'frases' : 'palabras';
  const [form, setForm] = useState({ english: '', spanish: '', context: '' });
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState('');

  const filteredWords = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return words;
    return words.filter((word) => (
      word.english.toLocaleLowerCase().includes(normalized)
      || word.spanish.toLocaleLowerCase().includes(normalized)
    ));
  }, [words, query]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await addWord({ ...form, type: itemType });
    if (!result.ok) {
      setMessage(result.reason === 'duplicate'
        ? { type: 'error', text: `Esa ${singular} en inglés ya está guardada.` }
        : { type: 'error', text: result.message ?? 'No fue posible guardar el vocabulario.' });
      return;
    }
    setForm({ english: '', spanish: '', context: '' });
    setMessage({ type: 'success', text: `${isPhrase ? 'Frase' : 'Palabra'} guardada de forma segura.` });
  };

  return (
    <div className="view-scroll vocabulary-view">
      <section className="card vocabulary-form-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{isPhrase ? 'FRASES PERSONALES' : 'VOCABULARIO PERSONAL'}</p>
            <h3>Agrega una {singular} nueva</h3>
          </div>
          <span className="word-count">{words.length} {words.length === 1 ? singular : plural}</span>
        </div>

        <form onSubmit={handleSubmit} className="vocabulary-form">
          <div>
            <label className="field-label" htmlFor="englishWord">Inglés</label>
            <input
              id="englishWord"
              className="text-input"
              value={form.english}
              onChange={(event) => updateField('english', event.target.value)}
              placeholder={isPhrase ? 'Ej.: I am looking forward to it' : 'Ej.: nevertheless'}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="spanishMeaning">Español</label>
            <input
              id="spanishMeaning"
              className="text-input"
              value={form.spanish}
              onChange={(event) => updateField('spanish', event.target.value)}
              placeholder={isPhrase ? 'Ej.: Tengo muchas ganas' : 'Ej.: sin embargo'}
              autoComplete="off"
            />
          </div>
          <div className="context-field">
            <label className="field-label" htmlFor="wordContext">Contexto o ejemplo (opcional)</label>
            <input
              id="wordContext"
              className="text-input"
              value={form.context}
              onChange={(event) => updateField('context', event.target.value)}
              placeholder={isPhrase ? 'Ej.: Una situación donde usarías esta frase' : 'Ej.: Nevertheless, we continued.'}
              autoComplete="off"
            />
          </div>
          <button className="btn-primary vocabulary-submit" type="submit">+ Guardar</button>
        </form>
        {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
      </section>

      <section className="card vocabulary-list-card">
        <div className="section-heading vocabulary-list-heading">
          <div>
            <p className="eyebrow">TU COLECCIÓN</p>
            <h3>{isPhrase ? 'Frases guardadas' : 'Palabras guardadas'}</h3>
          </div>
          {words.length > 0 && (
            <input
              className="text-input vocabulary-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar ${singular}…`}
              aria-label={`Buscar ${singular}`}
            />
          )}
        </div>

        {loading ? (
          <div className="empty-list">Cargando tu vocabulario…</div>
        ) : error ? (
          <div className="empty-list">{error}</div>
        ) : words.length === 0 ? (
          <div className="empty-list">
            Aún no guardaste {plural}. Agrega la primera para comenzar tu colección personal.
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="empty-list">No encontramos {plural} para esa búsqueda.</div>
        ) : (
          <div className="word-list">
            {filteredWords.map((word) => {
              const accuracy = word.attempts ? Math.round((word.correct / word.attempts) * 100) : null;
              return (
                <article className="word-item" key={word.id}>
                  <div className="word-pair">
                    <strong>{word.english}</strong>
                    <span aria-hidden="true">→</span>
                    <span>{word.spanish}</span>
                  </div>
                  {word.context && <p className="word-context">{word.context}</p>}
                  <div className="word-meta">
                    <span>{accuracy === null ? 'Sin practicar' : `${accuracy}% · ${word.attempts} intentos`}</span>
                    <button
                      className="btn-delete-word"
                      onClick={async () => {
                        try { await removeWord(word.id); }
                        catch (requestError) { setMessage({ type: 'error', text: requestError.message }); }
                      }}
                      aria-label={`Eliminar ${word.english}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
