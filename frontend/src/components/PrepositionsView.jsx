import { useEffect, useMemo, useState } from 'react';
import { normalize, similarity } from '../utils/utils';
import { prepositionLessons } from '../data/prepositionLessons';

const STORAGE_KEY = 'englishTrainerPrepositionProgress';

function savedProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

function acceptedAnswers(question) {
  if (!question.prompt.startsWith('Completa:')) return question.answers;
  const sentence = question.prompt.replace(/^Completa:\s*/, '');
  return question.answers.flatMap((answer) => [answer, sentence.replace('___', answer)]);
}

function mistakeExplanation(question, answer) {
  if (!question.mistakes) return null;
  const normalized = normalize(answer);
  const padded = ` ${normalized} `;
  const match = Object.entries(question.mistakes)
    .sort(([first], [second]) => second.length - first.length)
    .find(([option]) => normalized === option || padded.includes(` ${option} `));
  return match?.[1] ?? null;
}

export default function PrepositionsView() {
  const [lessonId, setLessonId] = useState('place');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(savedProgress);
  const lesson = prepositionLessons.find((item) => item.id === lessonId);
  const question = lesson.questions[questionIndex];
  const lessonCorrect = useMemo(() => lesson.questions.filter((_, index) => (
    progress[`${lesson.id}-${index}`]
  )).length, [lesson, progress]);

  useEffect(() => {
    setQuestionIndex(0);
    setAnswer('');
    setFeedback(null);
  }, [lessonId]);

  const checkAnswer = (event) => {
    event.preventDefault();
    if (!answer.trim() || feedback) return;
    const scores = acceptedAnswers(question).map((expected) => ({ expected, score: similarity(answer, expected) }));
    scores.sort((a, b) => b.score - a.score);
    const correct = scores[0].score >= 0.96;
    const mistake = mistakeExplanation(question, answer);
    setFeedback({
      correct,
      expected: scores[0].expected,
      explanation: mistake ?? question.explanation,
      similarity: Math.round(scores[0].score * 100),
    });
    if (correct) {
      const key = `${lesson.id}-${questionIndex}`;
      setProgress((current) => {
        const next = { ...current, [key]: true };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const nextQuestion = () => {
    setQuestionIndex((current) => (current + 1) % lesson.questions.length);
    setAnswer('');
    setFeedback(null);
  };

  return (
    <div className="view-scroll prepositions-view">
      <section className="card prepositions-intro">
        <div>
          <p className="eyebrow">MATERIA Y PRÁCTICA</p>
          <h3>Preposiciones en inglés</h3>
          <p>Aprende qué expresa cada preposición, observa cómo se usa y después practica con oraciones reales.</p>
        </div>
        <span>3 partes · 24 actividades</span>
      </section>

      <div className="preposition-tabs" aria-label="Tipos de preposiciones">
        {prepositionLessons.map((item) => {
          const correct = item.questions.filter((_, index) => progress[`${item.id}-${index}`]).length;
          return (
            <button key={item.id} className={`card${lessonId === item.id ? ' active' : ''}`} onClick={() => setLessonId(item.id)}>
              <span>{item.icon}</span>
              <div><strong>{item.title}</strong><small>{correct}/{item.questions.length} correctas</small></div>
            </button>
          );
        })}
      </div>

      <section className="card preposition-material">
        <div className="section-heading">
          <div><p className="eyebrow">PRIMERO, LA MATERIA</p><h3>{lesson.title}</h3></div>
          <span className="badge">{lesson.items.length} preposiciones</span>
        </div>
        <p className="preposition-description">{lesson.description}</p>
        <div className="preposition-cards">
          {lesson.items.map((item) => (
            <article className="preposition-card" key={item.word}>
              <div><strong>{item.word}</strong><span>{item.meaning}</span></div>
              <p>{item.use}</p>
              <blockquote><strong>{item.example}</strong><span>{item.translation}</span></blockquote>
            </article>
          ))}
        </div>
      </section>

      <section className="card preposition-practice">
        <div className="exercise-topline">
          <div><p className="eyebrow">AHORA, PRACTICA</p><strong>{lessonCorrect}/{lesson.questions.length} correctas</strong></div>
          <span className="counter">Pregunta {questionIndex + 1} de {lesson.questions.length}</span>
        </div>
        <h3>{question.prompt}</h3>
        <form onSubmit={checkAnswer}>
          <label className="field-label" htmlFor="prepositionAnswer">
            {question.prompt.startsWith('Completa:') ? 'Escribe lo que falta o la oración completa' : 'Tu respuesta en inglés'}
          </label>
          <input id="prepositionAnswer" className="text-input" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={Boolean(feedback)} autoComplete="off" />
          {!feedback ? <button className="btn-primary" type="submit">Comprobar</button> : (
            <div className={`preposition-feedback ${feedback.correct ? 'success' : 'error'}`}>
              <div><strong>{feedback.correct ? '¡Correcto!' : `Respuesta válida: ${feedback.expected}`}</strong><span>{feedback.similarity}% de similitud</span></div>
              <p>{feedback.explanation}</p>
              <button className="btn-secondary" type="button" onClick={nextQuestion}>Siguiente pregunta →</button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
