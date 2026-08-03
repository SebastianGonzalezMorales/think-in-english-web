import { useMemo, useState } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { similarity } from '../utils/utils';

const MODES = [
  { id: 'en-es', label: 'Inglés → Español' },
  { id: 'es-en', label: 'Español → Inglés' },
  { id: 'mixed', label: 'Mezclado' },
];

function shuffled(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function createQueue(words, mode) {
  return shuffled(words).map((word, index) => ({
    ...word,
    direction: mode === 'mixed'
      ? (index % 2 === 0 ? 'en-es' : 'es-en')
      : mode,
  }));
}

export default function VocabularyPracticeView({ onGoToVocabulary, itemType = 'word' }) {
  const vocabulary = useVocabulary();
  const words = itemType === 'phrase' ? vocabulary.phrases : vocabulary.words;
  const { recordAttempt } = vocabulary;
  const isPhrase = itemType === 'phrase';
  const singular = isPhrase ? 'frase' : 'palabra';
  const plural = isPhrase ? 'frases' : 'palabras';
  const [mode, setMode] = useState('mixed');
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = queue[index];
  const started = queue.length > 0 && !finished;
  const accuracy = useMemo(
    () => (queue.length ? Math.round((score / queue.length) * 100) : 0),
    [score, queue.length],
  );

  const startPractice = () => {
    setQueue(createQueue(words, mode));
    setIndex(0);
    setAnswer('');
    setFeedback(null);
    setScore(0);
    setFinished(false);
  };

  const checkAnswer = (event) => {
    event.preventDefault();
    if (!answer.trim() || feedback) return;
    const expected = current.direction === 'en-es' ? current.spanish : current.english;
    const correct = similarity(answer, expected) >= 0.9;
    recordAttempt(current.id, correct);
    if (correct) setScore((value) => value + 1);
    setFeedback({ correct, expected });
  };

  const nextWord = () => {
    if (index === queue.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setAnswer('');
    setFeedback(null);
  };

  if (words.length === 0) {
    return (
      <div className="view-scroll">
        <section className="card vocabulary-empty-practice">
          <div className="empty-icon">Aa</div>
          <h3>Primero agrega algunas {plural}</h3>
          <p>Necesitas {plural} guardadas para iniciar una sesión de memorización.</p>
          <button className="btn-primary" onClick={onGoToVocabulary}>Ir a Mis {plural}</button>
        </section>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="view-scroll">
        <section className="card vocabulary-result">
          <div className="modal-icon">✓</div>
          <p className="eyebrow">SESIÓN COMPLETADA</p>
          <h3>Terminaste tu repaso</h3>
          <strong>{accuracy}%</strong>
          <p>{score} de {queue.length} respuestas correctas.</p>
          <button className="btn-primary" onClick={startPractice}>Practicar otra vez</button>
        </section>
      </div>
    );
  }

  return (
    <div className="view-scroll vocabulary-practice-view">
      {!started ? (
        <section className="card practice-setup">
          <p className="eyebrow">{isPhrase ? 'REPASO DE FRASES' : 'REPASO DE VOCABULARIO'}</p>
          <h3>Elige cómo quieres practicar</h3>
          <p className="practice-intro">
            Usaremos {words.length === 1 ? `la ${singular}` : `las ${words.length} ${plural}`} de tu
            colección en un orden diferente cada vez.
          </p>
          <div className="vocabulary-modes">
            {MODES.map((item) => (
              <button
                key={item.id}
                className={`mode-card${mode === item.id ? ' active' : ''}`}
                onClick={() => setMode(item.id)}
              >
                <span>{item.id === 'mixed' ? '⇄' : '→'}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>
          <button className="btn-primary btn-full" onClick={startPractice}>
            Comenzar con {words.length} {words.length === 1 ? singular : plural}
          </button>
        </section>
      ) : (
        <section className="card vocabulary-quiz">
          <div className="exercise-topline">
            <span className="badge">
              {current.direction === 'en-es' ? 'Inglés → Español' : 'Español → Inglés'}
            </span>
            <span className="phrase-counter">{isPhrase ? 'Frase' : 'Palabra'} {index + 1} de {queue.length}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((index + (feedback ? 1 : 0)) / queue.length) * 100}%` }} />
          </div>

          <div className="vocabulary-prompt">
            <p className="eyebrow">
              {current.direction === 'en-es'
                ? '¿QUÉ SIGNIFICA EN ESPAÑOL?'
                : '¿CÓMO SE DICE EN INGLÉS?'}
            </p>
            <h3>{current.direction === 'en-es' ? current.english : current.spanish}</h3>
            {current.context && current.direction === 'en-es' && <p>{current.context}</p>}
          </div>

          <form onSubmit={checkAnswer}>
            <label className="field-label" htmlFor="vocabularyAnswer">
              Responde en {current.direction === 'en-es' ? 'español' : 'inglés'}
            </label>
            <input
              id="vocabularyAnswer"
              className="text-input quiz-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(feedback)}
              autoFocus
              autoComplete="off"
            />
            {!feedback ? (
              <button className="btn-primary btn-full" type="submit">Comprobar respuesta</button>
            ) : (
              <>
                <div className={`vocabulary-feedback ${feedback.correct ? 'success' : 'error'}`}>
                  <strong>{feedback.correct ? '¡Muy bien!' : 'Respuesta correcta:'}</strong>
                  {!feedback.correct && <span>{feedback.expected}</span>}
                </div>
                <button className="btn-primary btn-full" type="button" onClick={nextWord}>
                  {index === queue.length - 1 ? 'Ver resultado' : `Siguiente ${singular}`}
                </button>
              </>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
