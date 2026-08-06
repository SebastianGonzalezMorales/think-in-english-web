import { useEffect, useMemo, useState } from 'react';
import { similarity } from '../utils/utils';
import { TENSE_LEVELS, TENSE_PERIODS, tenseLessons } from '../data/tenseLessons';

const STORAGE_KEY = 'englishTrainerTenseProgress';
const POSITION_STORAGE_KEY = 'englishTrainerTensePositions';

const PRACTICE_HELP = {
  'present-simple': {
    action: 'Acciones como work, study, live o play. Usa do o does en preguntas y negaciones.',
    be: 'Ser o estar en presente. Elige am, is o are según el sujeto; no uses do ni does.',
  },
  'past-simple': {
    action: 'En afirmaciones usa el verbo en pasado; en preguntas y negaciones usa did con todos los sujetos.',
    be: 'Ser o estar en el pasado. Elige was o were según el sujeto; no uses did.',
  },
};

function savedProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

function savedPositions() {
  try { return JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

function Formation({ text }) {
  const exceptionLabel = 'Excepción — verbo to be:';
  const [regularText, exceptionText] = text.split(exceptionLabel);
  const sections = [
    { title: exceptionText ? 'Regla general' : 'Cómo se forma', text: regularText, exception: false },
    ...(exceptionText ? [{ title: 'Excepción: verbo to be', text: exceptionText, exception: true }] : []),
  ];

  return sections.map((section) => (
    <div className={`tense-formula-group${section.exception ? ' exception' : ''}`} key={section.title}>
      <h4>{section.title}</h4>
      {section.text.split('\n').filter(Boolean).map((line) => {
        const [rule, examples] = line.split(' Ejemplos: ');
        const separator = rule.indexOf(':');
        const label = separator >= 0 ? rule.slice(0, separator) : null;
        const formula = separator >= 0 ? rule.slice(separator + 1).trim() : rule;
        return (
          <p className="tense-formula-line" key={line}>
            {label && <span className="tense-formula-label">{label}</span>}
            <b className="tense-formula-value">{formula}</b>
            {examples && <strong>Ejemplos: {examples}</strong>}
          </p>
        );
      })}
    </div>
  ));
}

function KeyRule({ text }) {
  const separator = text.indexOf(' → ');
  if (separator < 0) return <span>{text}</span>;
  return (
    <div className="tense-rule-content">
      <strong className="tense-rule-keyword">{text.slice(0, separator)}</strong>
      <span>{text.slice(separator + 3)}</span>
    </div>
  );
}

function BeException({ content, compact = false }) {
  return (
    <section className={`tense-be-exception${compact ? ' compact' : ''}${content.usage ? ' has-usage' : ''}`} aria-label="Excepción: verbo to be">
      <div className="tense-be-intro">
        <div className="tense-be-heading">
          <span>EXCEPCIÓN</span>
          <h4>Verbo to be</h4>
        </div>
        <p className="tense-be-description">{content.description}</p>
        {content.usage && <div className="tense-be-usage"><strong>¿Cuándo se usa?</strong><p>{content.usage}</p></div>}
        {content.conjugationPrompt && <p className="tense-be-prompt">{content.conjugationPrompt}</p>}
        <div className="tense-be-conjugations">
          {content.conjugations.map((item) => (
            typeof item === 'string' ? <strong key={item}>{item}</strong> : (
              <div className="tense-be-choice" key={item.verb}>
                <strong><span>{item.subjects}</span><b>→ {item.verb}</b></strong>
                <div className="tense-be-choice-examples">
                  {(item.examples ?? [[item.example, '']]).map(([english, spanish]) => (
                    <small key={english}><b>{english}</b>{spanish && <span>{spanish}</span>}</small>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
        <p className="tense-be-note">{content.note}</p>
      </div>
      {content.nounAgreement && (
        <div className="tense-be-noun-agreement">
          <div className="tense-be-noun-heading">
            <h5>{content.nounAgreement.title}</h5>
            <p>{content.nounAgreement.intro}</p>
          </div>
          <div className="tense-be-noun-groups">
            {content.nounAgreement.groups.map((group) => (
              <div className="tense-be-noun-group" key={group.label}>
                <strong>{group.label}</strong>
                <div className="tense-be-noun-examples">
                  {group.examples.map(([english, spanish]) => (
                    <small key={english}><b>{english}</b><span>{spanish}</span></small>
                  ))}
                </div>
                <div className="tense-be-equivalences">
                  {group.equivalences.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
          <p className="tense-be-you-note"><strong>Importante:</strong> {content.nounAgreement.youNote}</p>
        </div>
      )}
      <div className="tense-be-section">
        <h5>Estructuras</h5>
        {content.structures.map((item) => <p className="tense-be-structure" key={item}>{item}</p>)}
      </div>
      <div className="tense-be-section">
        <h5>Ejemplos</h5>
        <div className="tense-be-examples">
          {content.examples.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="tense-be-comparison">
          <h5>Compara</h5>
          {content.comparison.map(([example, label]) => (
            <p key={example}><span>{label}</span><strong>{example}</strong></p>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoQuestions({ content }) {
  return (
    <section className="tense-who-questions" aria-label="Preguntas con Who">
      <div className="tense-who-heading">
        <div>
          <span>ACLARACIÓN</span>
          <h4>{content.title}</h4>
        </div>
        <p>{content.intro}</p>
      </div>
      <div className="tense-who-cards">
        {content.cases.map((item) => (
          <article key={item.label}>
            <strong>{item.label}</strong>
            <p className="tense-who-explanation">{item.explanation}</p>
            <b>{item.structure}</b>
            <div className="tense-who-case-examples">
              {item.examples.map(([english, spanish]) => (
                <p key={english}><span>{english}</span><small>{spanish}</small></p>
              ))}
            </div>
            <em>{item.help}</em>
          </article>
        ))}
      </div>
      <div className="tense-who-comparison">
        <h5>Compara</h5>
        {content.comparison.map(([english, spanish, explanation]) => (
          <p key={english}><strong>{english}</strong><span>{spanish}</span><small>{explanation}</small></p>
        ))}
      </div>
      <div className="tense-who-rule">
        <strong>{content.supportQuestion}</strong>
        {content.quickRules.map((rule) => <p key={rule}>{rule}</p>)}
      </div>
    </section>
  );
}

function acceptedAnswers(question) {
  if (!question.prompt.startsWith('Completa:')) return question.answers;
  const sentence = question.prompt.replace(/^Completa:\s*/, '');
  return question.answers.flatMap((answer) => {
    const completedSentence = /___.*?\([^)]*\)/.test(sentence)
      ? sentence.replace(/___.*?\([^)]*\)/, answer)
      : sentence.replace('___', answer);
    return [answer, completedSentence];
  });
}

export default function TensesView() {
  const [level, setLevel] = useState('conversation');
  const [period, setPeriod] = useState('all');
  const [lessonId, setLessonId] = useState('present-simple');
  const [exerciseKind, setExerciseKind] = useState('action');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(savedProgress);

  const lessons = useMemo(() => tenseLessons.filter((lesson) => (
    lesson.level === level && (period === 'all' || lesson.period === period)
  )), [level, period]);
  const lesson = tenseLessons.find((item) => item.id === lessonId) ?? lessons[0];
  const hasSplitPractice = Boolean(lesson?.beException && PRACTICE_HELP[lesson.id]);
  const practiceQuestions = lesson?.questions.filter((item) => !hasSplitPractice || item.kind === exerciseKind) ?? [];
  const safeQuestionIndex = questionIndex < practiceQuestions.length ? questionIndex : 0;
  const question = practiceQuestions[safeQuestionIndex];
  const completed = Object.values(progress).filter(Boolean).length;
  const totalQuestions = tenseLessons.reduce((total, item) => total + item.questions.length, 0);

  useEffect(() => {
    if (!lessons.some((item) => item.id === lessonId)) setLessonId(lessons[0]?.id);
  }, [lessons, lessonId]);

  useEffect(() => {
    setExerciseKind('action');
    setAnswer('');
    setFeedback(null);
  }, [lessonId]);

  useEffect(() => {
    if (!practiceQuestions.length) return;
    const positionKey = `${lesson.id}:${exerciseKind}`;
    const storedPosition = savedPositions()[positionKey];
    const firstPending = practiceQuestions.findIndex((item) => !progress[item.progressId]);
    const restoredPosition = Number.isInteger(storedPosition) && storedPosition < practiceQuestions.length
      ? storedPosition
      : firstPending >= 0 ? firstPending : 0;
    setQuestionIndex(restoredPosition);
    setAnswer('');
    setFeedback(null);
  }, [lesson.id, exerciseKind]);

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
      const key = question.progressId;
      setProgress((current) => {
        const next = { ...current, [key]: true };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const nextQuestion = () => {
    setQuestionIndex((current) => {
      const nextIndex = (current + 1) % practiceQuestions.length;
      const positions = savedPositions();
      positions[`${lesson.id}:${exerciseKind}`] = nextIndex;
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions));
      return nextIndex;
    });
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
        <p>Puedes estudiar una estructura y completar sus actividades antes de continuar. Si te sirve, prueba una por día.</p>
        <small>12 estructuras · {totalQuestions} actividades</small>
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
            const correct = item.questions.filter((itemQuestion) => progress[itemQuestion.progressId]).length;
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
              <div className={`tense-theory-grid${['present-simple', 'past-simple'].includes(lesson.id) ? ` restructured ${lesson.id}` : ''}`}>
                <div className="tense-formula">
                  <Formation text={lesson.structure} />
                </div>
                <div className="tense-details">
                  <div><h4>Reglas clave</h4><ul>{lesson.rules.map((rule) => <li key={rule}><KeyRule text={rule} /></li>)}</ul></div>
                  <div><h4>Ejemplos</h4><div className="tense-examples">{lesson.examples.map(([english, spanish]) => <div className="tense-example" key={english}><strong>{english}</strong><span>{spanish}</span></div>)}</div></div>
                </div>
              </div>
              {lesson.beException && <BeException content={lesson.beException} compact={['present-simple', 'past-simple'].includes(lesson.id)} />}
              {lesson.whoQuestions && <WhoQuestions content={lesson.whoQuestions} />}
            </section>

            <section className="card tense-quiz">
              <div className="exercise-topline"><span className="eyebrow">PONLO EN PRÁCTICA</span><span className="counter">Pregunta {safeQuestionIndex + 1} de {practiceQuestions.length}</span></div>
              {hasSplitPractice && (
                <div className="tense-practice-switch" aria-label="Tipo de verbo">
                  <button type="button" className={exerciseKind === 'action' ? 'active' : ''} onClick={() => setExerciseKind('action')}>Verbos normales</button>
                  <button type="button" className={exerciseKind === 'be' ? 'active' : ''} onClick={() => setExerciseKind('be')}>Verbo to be</button>
                </div>
              )}
              {hasSplitPractice && <p className="tense-practice-help">{PRACTICE_HELP[lesson.id][exerciseKind]}</p>}
              {hasSplitPractice && <span className={`tense-question-kind ${question.kind}`}>{question.kind === 'be' ? 'Verbo to be' : 'Verbo de acción'}</span>}
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
                  placeholder={question.prompt.startsWith('Completa:') ? 'Escribe tu respuesta' : ''}
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
