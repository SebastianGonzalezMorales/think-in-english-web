import { useEffect, useMemo, useState } from 'react';
import { similarity } from '../utils/utils';
import { TENSE_LEVELS, TENSE_PERIODS, tenseLessons } from '../data/tenseLessons';

const STORAGE_KEY = 'englishTrainerTenseProgress';

function savedProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

function Formation({ text }) {
  return text.split('\n').map((line) => {
    const [rule, examples] = line.split(' Ejemplos: ');
    return (
      <p className="tense-formula-line" key={line}>
        <span>{rule}</span>
        {examples && <strong>Ejemplos: {examples}</strong>}
      </p>
    );
  });
}

function acceptedAnswers(question) {
  if (!question.prompt.startsWith('Completa:')) return question.answers;
  const sentence = question.prompt.replace(/^Completa:\s*/, '');
  return question.answers.flatMap((answer) => [
    answer,
    sentence.replace(/___.*?\([^)]*\)/, answer),
  ]);
}

export default function TensesView() {
  const [level, setLevel] = useState('conversation');
  const [period, setPeriod] = useState('all');
  const [lessonId, setLessonId] = useState('present-simple');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(savedProgress);

  const lessons = useMemo(() => tenseLessons.filter((lesson) => (
    lesson.level === level && (period === 'all' || lesson.period === period)
  )), [level, period]);
  const lesson = tenseLessons.find((item) => item.id === lessonId) ?? lessons[0];
  const question = lesson?.questions[questionIndex];
  const completed = Object.values(progress).filter(Boolean).length;

  useEffect(() => {
    if (!lessons.some((item) => item.id === lessonId)) setLessonId(lessons[0]?.id);
  }, [lessons, lessonId]);

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
    // Grammar practice needs a stricter threshold than general phrase practice:
    // an extra preposition can change the grammar while keeping most characters equal.
    const correct = scores[0].score >= 0.96;
    setFeedback({
      correct,
      expected: scores[0].expected,
      explanation: question.explanation,
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
    <div className="view-scroll tenses-view">
      <section className="card tenses-intro">
        <div>
          <p className="eyebrow">GUÍA Y PRÁCTICA</p>
          <h3>Domina los tiempos verbales</h3>
          <p>Aprende una estructura a la vez y comprueba si puedes usarla en una respuesta real.</p>
        </div>
        <div className="tense-progress">
          <strong>12</strong>
          <span>estructuras en total</span>
          <small>{completed} actividades correctas</small>
        </div>
      </section>

      <section className="tense-daily-plan" aria-label="Sugerencia de estudio">
        <span>SUGERENCIA DE ESTUDIO</span>
        <strong>Avanza a tu ritmo</strong>
        <p>Puedes estudiar una estructura y completar sus 12 actividades antes de continuar. Si te sirve, prueba una por día.</p>
        <small>12 estructuras · 144 actividades</small>
      </section>

      <div className="tense-levels" aria-label="Nivel de aprendizaje">
        {Object.entries(TENSE_LEVELS).map(([id, item]) => (
          <button key={id} className={`card tense-level${level === id ? ' active' : ''}`} onClick={() => setLevel(id)}>
            <span>6</span>
            <div><strong>{item.label}</strong><p>{item.description}</p></div>
          </button>
        ))}
      </div>

      <div className="tense-periods" aria-label="Tiempo verbal">
        {TENSE_PERIODS.map((item) => (
          <button key={item.id} className={period === item.id ? 'active' : ''} onClick={() => setPeriod(item.id)}>{item.label}</button>
        ))}
      </div>

      <div className="tenses-layout">
        <aside className="card tense-list">
          <p className="eyebrow">LECCIONES</p>
          {lessons.map((item) => {
            const correct = item.questions.filter((_, index) => progress[`${item.id}-${index}`]).length;
            return (
              <button key={item.id} className={lesson?.id === item.id ? 'active' : ''} onClick={() => setLessonId(item.id)}>
                <div><strong>{item.title}</strong><span>{item.summary}</span></div>
                <small>{correct}/{item.questions.length}</small>
              </button>
            );
          })}
        </aside>

        {lesson && (
          <div className="tense-content">
            <section className="card tense-theory">
              <div className="section-heading">
                <div><p className="eyebrow">{lesson.period}</p><h3>{lesson.title}</h3></div>
                <span className="badge">{TENSE_LEVELS[lesson.level].label}</span>
              </div>
              <p className="tense-summary">{lesson.summary}</p>
              <div className="tense-formula">
                <span>CÓMO SE FORMA</span>
                <Formation text={lesson.structure} />
              </div>
              <div className="tense-details">
                <div><h4>Reglas clave</h4><ul>{lesson.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>
                <div><h4>Ejemplos</h4>{lesson.examples.map(([english, spanish]) => <div className="tense-example" key={english}><strong>{english}</strong><span>{spanish}</span></div>)}</div>
              </div>
            </section>

            <section className="card tense-quiz">
              <div className="exercise-topline"><span className="eyebrow">PONLO EN PRÁCTICA</span><span className="counter">Pregunta {questionIndex + 1} de {lesson.questions.length}</span></div>
              <h3>{question.prompt}</h3>
              <form onSubmit={checkAnswer}>
                <label className="field-label" htmlFor="tenseAnswer">
                  {question.prompt.startsWith('Completa:')
                    ? 'Escribe lo que falta o la oración completa'
                    : 'Tu respuesta en inglés'}
                </label>
                <input
                  id="tenseAnswer"
                  className="text-input"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={question.prompt.startsWith('Completa:') ? 'Ambas formas son válidas' : ''}
                  disabled={Boolean(feedback)}
                  autoComplete="off"
                />
                {!feedback ? <button className="btn-primary" type="submit">Comprobar</button> : (
                  <div className={`tense-feedback ${feedback.correct ? 'success' : 'error'}`}>
                    <div className="tense-feedback-heading">
                      <strong>{feedback.correct ? '¡Correcto!' : `Respuesta: ${feedback.expected}`}</strong>
                      <span>{feedback.similarity}% de similitud</span>
                    </div>
                    <p>{feedback.explanation}</p>
                    <button className="btn-secondary" type="button" onClick={nextQuestion}>Siguiente pregunta →</button>
                  </div>
                )}
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
