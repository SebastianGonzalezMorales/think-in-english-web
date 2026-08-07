import { useEffect, useMemo, useRef, useState } from 'react';
import { describeCorrection, isAcceptableTypo, similarity } from '../utils/utils';
import { TENSE_LEVELS, TENSE_PERIODS, tenseLessons } from '../data/tenseLessons';

const STORAGE_KEY = 'englishTrainerTenseProgress';
const POSITION_STORAGE_KEY = 'englishTrainerTensePositions';
const RESULT_STORAGE_KEY = 'englishTrainerTenseLastResults';

const PRACTICE_HELP = {
  'present-simple': {
    'action-1': 'Primera parte de verbos normales: afirmaciones, terminaciones con he, she e it, y estructuras frecuentes.',
    'action-2': 'Segunda parte de verbos normales: negativas, preguntas y traducciones con do o does.',
    be: 'Ser o estar en presente. Elige am, is o are según el sujeto; no uses do ni does.',
  },
  'past-simple': {
    'action-1': 'Primera parte de verbos normales: afirmaciones y formas regulares e irregulares del pasado.',
    'action-2': 'Segunda parte de verbos normales: negativas, preguntas y traducciones con did.',
    be: 'Ser o estar en el pasado. Elige was o were según el sujeto; no uses did.',
  },
  'future-forms': {
    'part-1': 'Primera etapa de Will: afirmaciones, negativas, preguntas y respuestas cortas.',
    'part-2': 'Segunda etapa de Will: Wh- questions, transformaciones, promesas, ofrecimientos y predicciones.',
  },
};

const PRACTICE_OPTIONS = {
  'present-simple': [['action-1', 'Normales · Parte 1'], ['action-2', 'Normales · Parte 2'], ['be', 'Verbo to be']],
  'past-simple': [['action-1', 'Normales · Parte 1'], ['action-2', 'Normales · Parte 2'], ['be', 'Verbo to be']],
  'future-forms': [['part-1', 'Parte 1 · 12 preguntas'], ['part-2', 'Parte 2 · 13 preguntas']],
};

const QUESTION_KIND_LABELS = {
  action: 'Verbo de acción',
  be: 'Verbo to be',
  will: 'Will',
  'going-to': 'Going to',
  compare: 'Will vs. Going to',
};

function savedProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

function savedPositions() {
  try { return JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

function savedResults() {
  try { return JSON.parse(localStorage.getItem(RESULT_STORAGE_KEY)) ?? {}; }
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

function FutureFormsGuide({ content }) {
  const [activeSection, setActiveSection] = useState('will');
  const section = content.sections.find((item) => item.id === activeSection) ?? content.sections[0];

  return (
    <section className="future-forms-guide" aria-label="Formas de futuro">
      <div className="future-form-tabs" role="tablist" aria-label="Contenido de futuro">
        {content.sections.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === item.id}
            className={activeSection === item.id ? 'active' : ''}
            onClick={() => setActiveSection(item.id)}
            key={item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="future-form-panel" role="tabpanel">
        <div className="future-form-heading"><span>{section.eyebrow}</span><h4>{section.label}</h4><p>{section.intro}</p></div>
        {section.structures && (
          <div className="future-structure-list">
            {section.structures.map(([label, formula, example]) => (
              <article key={label}><span>{label}</span><strong>{formula}</strong><small>{example}</small></article>
            ))}
          </div>
        )}
        {section.uses && (
          <div className="future-use-list">
            {section.uses.map(([label, example, explanation]) => (
              <article key={label}><span>{label}</span><strong>{example}</strong><p>{explanation}</p></article>
            ))}
          </div>
        )}
        {section.comparisons && (
          <div className="future-comparison-list">
            {section.comparisons.map(([example, form, explanation]) => (
              <article key={example}><span>{form}</span><strong>{example}</strong><p>{explanation}</p></article>
            ))}
          </div>
        )}
        {section.quickRule && <p className="future-quick-rule"><strong>Regla rápida:</strong> {section.quickRule}</p>}
      </div>
    </section>
  );
}

function acceptedAnswers(question) {
  if (!question.prompt.startsWith('Completa')) return question.answers;
  const sentence = question.prompt.replace(/^Completa[^:]*:\s*/, '');
  return question.answers.flatMap((answer) => {
    const completedSentence = /___.*?\([^)]*\)/.test(sentence)
      ? sentence.replace(/___.*?\([^)]*\)/, answer)
      : sentence.replace('___', answer);
    const shortAnswer = completedSentence.includes('?')
      ? completedSentence.slice(completedSentence.lastIndexOf('?') + 1).trim()
      : null;
    return [answer, completedSentence, shortAnswer].filter(Boolean);
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
  const [sessionResults, setSessionResults] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [progress, setProgress] = useState(savedProgress);
  const [lastResults, setLastResults] = useState(savedResults);
  const feedbackRef = useRef(null);

  const lessons = useMemo(() => tenseLessons.filter((lesson) => (
    lesson.level === level && (period === 'all' || lesson.period === period)
  )), [level, period]);
  const lesson = tenseLessons.find((item) => item.id === lessonId) ?? lessons[0];
  const practiceOptions = PRACTICE_OPTIONS[lesson?.id] ?? null;
  const hasSplitPractice = Boolean(practiceOptions);
  const activeExerciseKind = practiceOptions?.some(([kind]) => kind === exerciseKind)
    ? exerciseKind
    : practiceOptions?.[0][0] ?? exerciseKind;
  const practiceQuestions = lesson?.questions.filter((item) => (
    !hasSplitPractice || (item.practiceGroup ?? item.kind) === activeExerciseKind
  )) ?? [];
  const safeQuestionIndex = questionIndex < practiceQuestions.length ? questionIndex : 0;
  const question = practiceQuestions[safeQuestionIndex];
  const completed = Object.values(progress).filter(Boolean).length;
  const totalQuestions = tenseLessons.reduce((total, item) => total + item.questions.length, 0);
  const sessionCorrect = sessionResults.filter((result) => result.correct).length;
  const sessionScore = sessionResults.length ? Math.round((sessionCorrect / sessionResults.length) * 100) : 0;
  const sessionLabel = practiceOptions?.find(([kind]) => kind === activeExerciseKind)?.[1] ?? 'práctica general';
  const scoreMessage = sessionScore === 100
    ? '¡Excelente! Dominaste esta práctica.'
    : sessionScore >= 75
      ? '¡Muy bien! Estás cerca de dominarla.'
      : sessionScore >= 50
        ? 'Buen avance. Repasa tus errores y vuelve a intentarlo.'
        : 'Conviene repasar la explicación y repetir la práctica.';

  useEffect(() => {
    if (!lessons.some((item) => item.id === lessonId)) setLessonId(lessons[0]?.id);
  }, [lessons, lessonId]);

  useEffect(() => {
    setExerciseKind(PRACTICE_OPTIONS[lessonId]?.[0][0] ?? 'action');
    setAnswer('');
    setFeedback(null);
    setSessionResults([]);
    setQuizComplete(false);
  }, [lessonId]);

  useEffect(() => {
    if (!practiceQuestions.length) return;
    const positionKey = `${lesson.id}:${activeExerciseKind}`;
    const storedPosition = savedPositions()[positionKey];
    const firstPending = practiceQuestions.findIndex((item) => !progress[item.progressId]);
    const restoredPosition = Number.isInteger(storedPosition) && storedPosition < practiceQuestions.length
      ? storedPosition
      : firstPending >= 0 ? firstPending : 0;
    setQuestionIndex(restoredPosition);
    setAnswer('');
    setFeedback(null);
    setSessionResults([]);
    setQuizComplete(false);
  }, [lesson.id, activeExerciseKind]);

  useEffect(() => {
    if (!feedback) return undefined;
    const frame = requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [feedback]);

  const checkAnswer = (event) => {
    event.preventDefault();
    if (!answer.trim() || feedback) return;
    const scores = acceptedAnswers(question).map((expected) => ({ expected, score: similarity(answer, expected) }));
    scores.sort((a, b) => b.score - a.score);
    // Grammar practice requires a normalized match: punctuation and supported
    // contraction variants are accepted, but a grammar word cannot be omitted.
    const typoAccepted = scores[0].score !== 1 && isAcceptableTypo(answer, scores[0].expected);
    const correct = scores[0].score === 1 || typoAccepted;
    setFeedback({
      correct,
      expected: scores[0].expected,
      explanation: question.explanation,
      similarity: Math.round(scores[0].score * 100),
      correction: correct ? null : describeCorrection(answer, scores[0].expected),
      typoCorrection: typoAccepted ? describeCorrection(answer, scores[0].expected) : null,
    });
    setSessionResults((current) => [...current, {
      correct,
      prompt: question.prompt,
      answer: answer.trim(),
      expected: scores[0].expected,
    }]);
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
    if (sessionResults.length >= practiceQuestions.length) {
      const resultKey = `${lesson.id}:${activeExerciseKind}`;
      const latestResult = {
        correct: sessionCorrect,
        total: sessionResults.length,
        score: sessionScore,
        completedAt: new Date().toISOString(),
      };
      setLastResults((current) => {
        const next = { ...current, [resultKey]: latestResult };
        localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setQuizComplete(true);
      return;
    }
    setQuestionIndex((current) => {
      const nextIndex = (current + 1) % practiceQuestions.length;
      const positions = savedPositions();
      positions[`${lesson.id}:${activeExerciseKind}`] = nextIndex;
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions));
      return nextIndex;
    });
    setAnswer('');
    setFeedback(null);
  };

  const restartPractice = () => {
    setQuestionIndex(0);
    setAnswer('');
    setFeedback(null);
    setSessionResults([]);
    setQuizComplete(false);
    const positions = savedPositions();
    positions[`${lesson.id}:${activeExerciseKind}`] = 0;
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions));
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
            const itemPracticeOptions = PRACTICE_OPTIONS[item.id];
            const splitProgress = itemPracticeOptions
              ? itemPracticeOptions.map(([kind, label]) => {
                return {
                  kind,
                  label: label.replace(/ · \d+ preguntas$/, ''),
                  result: lastResults[`${item.id}:${kind}`],
                };
              })
              : null;
            return (
              <button key={item.id} className={`${lesson?.id === item.id ? 'active' : ''}${splitProgress ? ' has-split-progress' : ''}`} onClick={() => setLessonId(item.id)}>
                <div><strong>{item.title}</strong><span>{item.summary}</span></div>
                {splitProgress ? (
                  <div className="tense-list-split-progress" aria-label="Último resultado">
                    <b>Último resultado</b>
                    {splitProgress.map((itemProgress) => (
                      <span key={itemProgress.kind}>
                        <small>{itemProgress.label}</small>
                        <strong>{itemProgress.result ? `${itemProgress.result.score}%` : '—'}</strong>
                      </span>
                    ))}
                  </div>
                ) : <small>{correct}/{item.questions.length}</small>}
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
              {lesson.futureForms ? <FutureFormsGuide content={lesson.futureForms} /> : <div className={`tense-theory-grid${['present-simple', 'past-simple'].includes(lesson.id) ? ` restructured ${lesson.id}` : ''}`}>
                <div className="tense-formula">
                  <Formation text={lesson.structure} />
                </div>
                <div className="tense-details">
                  <div><h4>Reglas clave</h4><ul>{lesson.rules.map((rule) => <li key={rule}><KeyRule text={rule} /></li>)}</ul></div>
                  <div><h4>Ejemplos</h4><div className="tense-examples">{lesson.examples.map(([english, spanish]) => <div className="tense-example" key={english}><strong>{english}</strong><span>{spanish}</span></div>)}</div></div>
                </div>
              </div>}
              {lesson.beException && <BeException content={lesson.beException} compact={['present-simple', 'past-simple'].includes(lesson.id)} />}
              {lesson.whoQuestions && <WhoQuestions content={lesson.whoQuestions} />}
            </section>

            <section className="card tense-quiz">
              <div className="exercise-topline"><span className="eyebrow">PONLO EN PRÁCTICA</span><span className="counter">{quizComplete ? 'Práctica finalizada' : `Pregunta ${feedback ? sessionResults.length : sessionResults.length + 1} de ${practiceQuestions.length}`}</span></div>
              {hasSplitPractice && (
                <div className={`tense-practice-switch${practiceOptions.length === 3 ? ' three-options' : ''}`} aria-label="Tipo de práctica">
                  {practiceOptions.map(([kind, label]) => (
                    <button type="button" className={activeExerciseKind === kind ? 'active' : ''} onClick={() => setExerciseKind(kind)} key={kind}>{label}</button>
                  ))}
                </div>
              )}
              {quizComplete ? (
                <div className="tense-results" aria-live="polite">
                  <p className="eyebrow">RESUMEN DE TU PRÁCTICA</p>
                  <h3>{lesson.title}: {sessionLabel}</h3>
                  <div className="tense-score">
                    <strong>{sessionScore}<span>%</span></strong>
                    <div><b>{scoreMessage}</b><p>Completaste {sessionResults.length} preguntas: {sessionCorrect} correctas y {sessionResults.length - sessionCorrect} por repasar.</p></div>
                  </div>
                  <div className="tense-result-stats">
                    <span><strong>{sessionCorrect}</strong>Aciertos</span>
                    <span><strong>{sessionResults.length - sessionCorrect}</strong>Por repasar</span>
                    <span><strong>{sessionResults.length}</strong>Respondidas</span>
                  </div>
                  <button className="btn-primary" type="button" onClick={restartPractice}>Repetir práctica</button>
                </div>
              ) : (
                <>
                  {hasSplitPractice && <p className="tense-practice-help">{PRACTICE_HELP[lesson.id][activeExerciseKind]}</p>}
                  {hasSplitPractice && <span className={`tense-question-kind ${question.kind}`}>{QUESTION_KIND_LABELS[question.kind] ?? sessionLabel}</span>}
                  <h3>{question.prompt}</h3>
                  <form onSubmit={checkAnswer}>
                <label className="field-label" htmlFor="tenseAnswer">
                  {question.prompt.startsWith('Completa')
                    ? 'Escribe lo que falta o la oración completa'
                    : 'Tu respuesta en inglés'}
                </label>
                <input
                  id="tenseAnswer"
                  className="text-input"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={question.prompt.startsWith('Completa') ? 'Puedes escribir lo que falta o la respuesta completa' : ''}
                  disabled={Boolean(feedback)}
                  autoComplete="off"
                />
                {!feedback ? <button className="btn-primary" type="submit">Comprobar</button> : (
                  <div ref={feedbackRef} className={`tense-feedback ${feedback.correct ? 'success' : 'error'}`}>
                    <div className="tense-feedback-heading">
                      <strong>{feedback.correct ? '¡Correcto!' : `Respuesta: ${feedback.expected}`}</strong>
                      <span>{feedback.similarity}% de similitud</span>
                    </div>
                    {feedback.typoCorrection && <p className="answer-correction accepted"><strong>Error de escritura aceptado:</strong> {feedback.typoCorrection}</p>}
                    {feedback.correction && <p className="answer-correction"><strong>Revisa:</strong> {feedback.correction}</p>}
                    <p>{feedback.explanation}</p>
                    <button className="btn-secondary" type="button" onClick={nextQuestion}>{sessionResults.length >= practiceQuestions.length ? 'Ver resumen →' : 'Siguiente pregunta →'}</button>
                  </div>
                )}
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
