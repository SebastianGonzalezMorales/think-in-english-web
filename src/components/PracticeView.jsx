import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIES, phraseBank } from '../data/phraseBank';
import { evaluateAnswer, shuffle } from '../utils/utils';
import { useStats } from '../hooks/useStats';

const LEVELS = [1, 2, 3, 4, 5];
const COUNTS = [5, 10, 15];

const MESSAGES = {
  success: ['Muy bien', 'Tu respuesta es correcta o muy cercana a una traducción natural.'],
  partial: ['Casi correcto', 'La idea principal está presente, pero hay diferencias que conviene revisar.'],
  error:   ['Necesita revisión', 'La respuesta se aleja de la estructura esperada o tiene errores importantes.'],
};

/**
 * reviewQueue: array of phrase ids to practice (passed from MistakesView).
 * When present, the config panel is hidden and those phrases are loaded directly.
 * onReviewDone: called when the review session ends.
 */
export default function PracticeView({ reviewQueue = null, onReviewDone }) {
  const { recordAnswer } = useStats();
  const isReviewMode = reviewQueue !== null;

  // ── Config (normal mode only) ────────────────────────────────────────────────
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level,    setLevel]    = useState(1);
  const [count,    setCount]    = useState(10);

  // ── Session ──────────────────────────────────────────────────────────────────
  const [queue,          setQueue]          = useState([]);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [started,        setStarted]        = useState(false);
  const [answered,       setAnswered]       = useState(false);

  // ── Answer ───────────────────────────────────────────────────────────────────
  const [input,       setInput]       = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [feedback,    setFeedback]    = useState(null);

  // ── Modal ────────────────────────────────────────────────────────────────────
  const [modalOpen,  setModalOpen]  = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const textareaRef = useRef(null);

  // When reviewQueue changes (entering review mode), auto-start with those phrases
  useEffect(() => {
    if (isReviewMode && reviewQueue.length > 0) {
      const phrases = reviewQueue
        .map((id) => phraseBank.find((p) => p.id === id))
        .filter(Boolean);
      setQueue(shuffle(phrases));
      setCurrentIndex(0);
      setSessionCorrect(0);
      setStarted(true);
      setAnswered(false);
      setInput('');
      setHintVisible(false);
      setFeedback(null);
    }
  }, [reviewQueue, isReviewMode]);

  // Auto-focus textarea on new question
  useEffect(() => {
    if (started && !answered) {
      const t = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [currentIndex, started, answered]);

  // ── Start (normal mode) ──────────────────────────────────────────────────────
  const startSession = useCallback(() => {
    const candidates = phraseBank.filter((p) => p.category === category && p.level === level);
    const fallback   = phraseBank.filter((p) => p.category === category && Math.abs(p.level - level) <= 1);
    const pool = candidates.length >= 2 ? candidates : fallback;
    let q = shuffle([...pool]);
    while (q.length < count) q = q.concat(shuffle([...pool]));
    q = q.slice(0, count);

    setQueue(q);
    setCurrentIndex(0);
    setSessionCorrect(0);
    setStarted(true);
    setAnswered(false);
    setInput('');
    setHintVisible(false);
    setFeedback(null);
  }, [category, level, count]);

  // ── Check ────────────────────────────────────────────────────────────────────
  const checkAnswer = useCallback(() => {
    if (answered) return;
    const trimmed = input.trim();
    if (!trimmed) { textareaRef.current?.focus(); return; }

    const phrase = queue[currentIndex];
    const ev = evaluateAnswer(trimmed, phrase);
    const correct = ev.result === 'success';

    setAnswered(true);
    setFeedback(ev);
    if (correct) setSessionCorrect((n) => n + 1);
    recordAnswer(phrase, correct, trimmed);
  }, [answered, input, queue, currentIndex, recordAnswer]);

  // ── Next ─────────────────────────────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    if (currentIndex >= queue.length - 1) {
      setFinalScore(Math.round((sessionCorrect / queue.length) * 100));
      setModalOpen(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setInput('');
    setHintVisible(false);
    setFeedback(null);
    setAnswered(false);
  }, [currentIndex, queue.length, sessionCorrect]);

  const onKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') checkAnswer();
  }, [checkAnswer]);

  const phrase   = queue[currentIndex];
  const progress = started ? ((currentIndex + (answered ? 1 : 0)) / queue.length) * 100 : 0;
  const isLast   = currentIndex === queue.length - 1;

  // ── Modal close ───────────────────────────────────────────────────────────────
  const closeModal = () => {
    setModalOpen(false);
    if (isReviewMode) {
      onReviewDone?.();
    } else {
      setStarted(false);
    }
  };

  return (
    <>
      <div className="practice-grid">
        {/* ── Setup card (hidden in review mode) ── */}
        {!isReviewMode && (
          <section className="card setup-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">CONFIGURACIÓN</p>
                <h3>Elige tu desafío</h3>
              </div>
              <span className="status-dot" />
            </div>

            <label className="field-label" htmlFor="categorySelect">Categoría</label>
            <select
              id="categorySelect"
              className="select-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <span className="field-label">Nivel</span>
            <div className="level-grid">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  className={`level-button${level === l ? ' active' : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>

            <span className="field-label">Frases por sesión</span>
            <div className="segmented">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  className={`seg-button${count === c ? ' active' : ''}`}
                  onClick={() => setCount(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <button className="btn-primary btn-full" onClick={startSession}>
              Comenzar sesión
            </button>
          </section>
        )}

        {/* ── Exercise card ── */}
        <section className={`card exercise-card${isReviewMode ? ' exercise-card--full' : ''}`}>
          {isReviewMode && (
            <div className="review-mode-banner">
              <span>↺</span> Modo repaso — {queue.length} frases pendientes
            </div>
          )}

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {!started ? (
            <div className="empty-state">
              <div className="empty-icon">A→EN</div>
              <h3>Piensa primero, traduce después</h3>
              <p>Selecciona una categoría y un nivel. Luego escribe la frase completa en inglés.</p>
            </div>
          ) : (
            <>
              <div className="exercise-topline">
                <span className="badge">{phrase.category} · Nivel {phrase.level}</span>
                <span className="counter">Frase {currentIndex + 1} de {queue.length}</span>
              </div>

              <div className="prompt-block">
                <p className="prompt-label">TRADUCE ESTA FRASE</p>
                <p className="prompt-sentence">{phrase.es}</p>
              </div>

              <label className="field-label" htmlFor="answerInput">Tu respuesta en inglés</label>
              <textarea
                id="answerInput"
                ref={textareaRef}
                rows={4}
                placeholder="Escribe tu traducción aquí…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={answered}
              />

              {!answered && (
                <div className="answer-actions">
                  <button className="btn-secondary" onClick={() => setHintVisible((v) => !v)}>
                    Ver pista
                  </button>
                  <button className="btn-primary" onClick={checkAnswer}>
                    Revisar respuesta
                  </button>
                </div>
              )}

              {hintVisible && (
                <div className="hint-box">Pista: {phrase.hint}</div>
              )}

              {feedback && (
                <div className={`feedback-box ${feedback.result}`}>
                  <div className="feedback-title-row">
                    <span>{MESSAGES[feedback.result][0]}</span>
                    <span>{Math.round(feedback.best.score * 100)}%</span>
                  </div>
                  <p>{MESSAGES[feedback.result][1]}</p>
                  <p><strong>Versión recomendada:</strong><br />{feedback.best.answer}</p>
                  {feedback.missing.length > 0 && feedback.result !== 'success' && (
                    <p><strong>Palabras o elementos que podrías revisar:</strong> {feedback.missing.join(', ')}</p>
                  )}
                  <p><strong>Explicación:</strong> {phrase.note}</p>
                  {phrase.answers.length > 1 && (
                    <p>
                      <strong>Otra opción válida:</strong><br />
                      {phrase.answers.find((a) => a !== feedback.best.answer) || phrase.answers[0]}
                    </p>
                  )}
                </div>
              )}

              {answered && (
                <button className="btn-primary btn-full" onClick={nextQuestion}>
                  {isLast ? 'Finalizar sesión' : 'Siguiente frase →'}
                </button>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Session modal ── */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div className="modal-icon">{isReviewMode ? '↺' : '✓'}</div>
            <p className="eyebrow">{isReviewMode ? 'REPASO TERMINADO' : 'SESIÓN TERMINADA'}</p>
            <h2 id="modalTitle">{finalScore >= 80 ? '¡Buen trabajo!' : 'Sigue practicando'}</h2>
            <p>
              {isReviewMode
                ? `Respondiste correctamente ${sessionCorrect} de ${queue.length} frases del repaso.`
                : `Respondiste correctamente ${sessionCorrect} de ${queue.length} frases en ${category}.`}
            </p>
            <div className="modal-score">
              <strong>{finalScore}%</strong>
              <span>precisión</span>
            </div>
            <button className="btn-primary btn-full" onClick={closeModal}>
              {isReviewMode ? 'Volver a frases difíciles' : 'Volver a practicar'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
