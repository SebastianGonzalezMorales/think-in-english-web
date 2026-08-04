export const TENSE_PERIODS = [
  { id: 'all', label: 'Todos' },
  { id: 'present', label: 'Presente' },
  { id: 'past', label: 'Pasado' },
  { id: 'future', label: 'Futuro' },
];

export const TENSE_LEVELS = {
  conversation: {
    label: 'Fundamentos',
    description: 'Las 6 estructuras más utilizadas para comunicarte en conversaciones cotidianas: rutinas, situaciones actuales, experiencias pasadas y planes futuros.',
  },
  advanced: {
    label: 'Más avanzado',
    description: '6 estructuras para relatar acontecimientos con orden, explicar duración y resultados, y expresarte con mayor precisión al conversar, estudiar o trabajar.',
  },
};

export const tenseLessons = [
  {
    id: 'present-simple', level: 'conversation', period: 'present', title: 'Present Simple',
    summary: 'Rutinas, hechos y situaciones habituales.',
    structure: 'Si el sujeto es I, you, we o they, usa el verbo en su forma original, sin “to” y sin cambiarlo. Ejemplos: I work · They study.\nSi el sujeto es he, she o it, agrega -s o -es al final del verbo. Ejemplos: He works · She studies.',
    rules: [
      'Para preguntar, empieza con do cuando el sujeto es I, you, we o they; usa does con he, she o it.',
      'Para negar, usa do not (don’t) o does not (doesn’t). Después de do o does, el verbo vuelve a su forma original.',
    ],
    examples: [
      ['I work from home on Fridays.', 'Trabajo desde casa los viernes.'],
      ['Does she speak English?', '¿Ella habla inglés?'],
    ],
    questions: [
      { prompt: 'Completa: She ___ (study) English every day.', answers: ['studies'], explanation: 'Con she, study cambia a studies.' },
      { prompt: 'Traduce: Trabajo aquí los lunes.', answers: ['I work here on Mondays', 'I work here every Monday'], explanation: 'Una rutina se expresa con present simple.' },
      { prompt: 'Completa: My brother ___ (watch) TV after dinner.', answers: ['watches'], explanation: 'Con my brother, equivalente a he, watch agrega -es.' },
      { prompt: 'Traduce: Ella vive cerca de la estación.', answers: ['She lives near the station', 'She lives close to the station'], explanation: 'Con she agregamos -s a live.' },
    ],
  },
  {
    id: 'present-continuous', level: 'conversation', period: 'present', title: 'Present Continuous',
    summary: 'Acciones que ocurren ahora o planes ya acordados.',
    structure: 'Con I: usa am + verbo terminado en -ing\nCon he, she e it: usa is + verbo terminado en -ing\nCon you, we y they: usa are + verbo terminado en -ing',
    rules: ['Usa am/is/are según el sujeto.', 'También sirve para planes futuros ya organizados.'],
    examples: [
      ['I am waiting for the bus.', 'Estoy esperando el autobús.'],
      ['We are meeting them tonight.', 'Nos reuniremos con ellos esta noche.'],
    ],
    questions: [
      { prompt: 'Completa: They ___ (have) lunch right now.', answers: ['are having'], explanation: 'La acción ocurre ahora: are + having.' },
      { prompt: 'Traduce: Estoy hablando con mi jefe.', answers: ['I am talking to my boss', "I'm talking to my boss"], explanation: 'Usamos am + verbo terminado en -ing.' },
      { prompt: 'Completa: I ___ (write) an email at the moment.', answers: ['am writing'], explanation: 'Con I usamos am y writing para una acción actual.' },
      { prompt: 'Traduce: Estamos preparando la cena.', answers: ['We are preparing dinner', "We're preparing dinner", 'We are making dinner', "We're making dinner"], explanation: 'La acción ocurre ahora: are + verbo terminado en -ing.' },
    ],
  },
  {
    id: 'past-simple', level: 'conversation', period: 'past', title: 'Past Simple',
    summary: 'Acciones terminadas en un momento pasado.',
    structure: 'Afirmación: sujeto + verbo en pasado\nNegación: sujeto + did not + verbo base\nPregunta: Did + sujeto + verbo base?',
    rules: ['Usa la forma pasada del verbo en afirmaciones.', 'Después de did o did not, usa el verbo base.'],
    examples: [
      ['I called her yesterday.', 'La llamé ayer.'],
      ['Did you enjoy the trip?', '¿Disfrutaste el viaje?'],
    ],
    questions: [
      { prompt: 'Completa: We ___ (go) to the beach last weekend.', answers: ['went'], explanation: 'Go es irregular: su pasado es went.' },
      { prompt: 'Traduce: No vi tu mensaje.', answers: ["I didn't see your message", 'I did not see your message'], explanation: 'Después de did not usamos see, no saw.' },
      { prompt: 'Completa: She ___ (buy) a new laptop yesterday.', answers: ['bought'], explanation: 'Buy es irregular: su pasado es bought.' },
      { prompt: 'Traduce: Ayer llegamos temprano.', answers: ['We arrived early yesterday', 'Yesterday, we arrived early'], explanation: 'La acción terminó ayer, por eso usamos arrived.' },
    ],
  },
  {
    id: 'future-forms', level: 'conversation', period: 'future', title: 'Future Simple: Will y Going to',
    summary: 'Decisiones, predicciones, intenciones y planes.',
    structure: 'Con will: sujeto + will + verbo base\nCon going to: sujeto + am / is / are + going to + verbo base',
    rules: ['Usa will para decisiones espontáneas y predicciones.', 'Usa going to para intenciones o planes previos.'],
    examples: [
      ["I'll help you with that.", 'Te ayudaré con eso.'],
      ["We're going to move next year.", 'Nos mudaremos el próximo año.'],
    ],
    questions: [
      { prompt: 'Completa: Look at those clouds! It ___ rain.', answers: ['is going to'], explanation: 'Hay evidencia visible, por eso usamos going to.' },
      { prompt: 'Traduce: Te llamaré más tarde.', answers: ["I'll call you later", 'I will call you later'], explanation: 'Will funciona para una promesa o decisión.' },
      { prompt: 'Completa: We ___ (visit) them next weekend.', answers: ['are going to visit'], explanation: 'Es un plan previo: are going to + visit.' },
      { prompt: 'Traduce: Vamos a viajar en julio.', answers: ['We are going to travel in July', "We're going to travel in July"], explanation: 'Going to expresa un plan que ya existe.' },
    ],
  },
  {
    id: 'present-perfect', level: 'conversation', period: 'present', title: 'Present Perfect',
    summary: 'Experiencias o acciones pasadas conectadas con el presente.',
    structure: 'Con I, you, we y they: usa have + participio pasado\nCon he, she e it: usa has + participio pasado',
    rules: ['No lo combines con un momento pasado terminado como yesterday.', 'Usa for para duración y since para el punto de inicio.'],
    examples: [
      ['I have visited London twice.', 'He visitado Londres dos veces.'],
      ['She has lived here since 2020.', 'Ella vive aquí desde 2020.'],
    ],
    questions: [
      { prompt: 'Completa: He ___ (never / try) sushi.', answers: ['has never tried'], explanation: 'Con he usamos has + participio tried.' },
      { prompt: 'Traduce: Llevamos cinco años trabajando aquí.', answers: ['We have worked here for five years', "We've worked here for five years"], explanation: 'La acción comenzó antes y continúa: present perfect + for.' },
      { prompt: 'Completa: They ___ (finish) the project already.', answers: ['have finished'], explanation: 'Con they usamos have + participio finished.' },
      { prompt: 'Traduce: Ya terminé mi tarea.', answers: ['I have already finished my homework', "I've already finished my homework", 'I have finished my homework already', "I've finished my homework already"], explanation: 'El resultado importa ahora: have + finished.' },
    ],
  },
  {
    id: 'past-continuous', level: 'conversation', period: 'past', title: 'Past Continuous',
    summary: 'Una acción en progreso en un momento del pasado.',
    structure: 'Con I, he, she e it: usa was + verbo terminado en -ing\nCon you, we y they: usa were + verbo terminado en -ing',
    rules: ['Usa was con I, he, she e it; were con you, we y they.', 'Suele dar el contexto para una acción breve en past simple.'],
    examples: [
      ['I was sleeping when you called.', 'Estaba durmiendo cuando llamaste.'],
      ['What were they doing?', '¿Qué estaban haciendo?'],
    ],
    questions: [
      { prompt: 'Completa: We ___ (drive) when it started to snow.', answers: ['were driving'], explanation: 'La acción estaba en progreso: were driving.' },
      { prompt: 'Traduce: Ella estaba cocinando a las ocho.', answers: ['She was cooking at eight', "She was cooking at eight o'clock"], explanation: 'Usamos was + cooking para ese momento pasado.' },
      { prompt: 'Completa: He ___ (sleep) at midnight.', answers: ['was sleeping'], explanation: 'Con he usamos was + sleeping.' },
      { prompt: 'Traduce: Estaban hablando cuando llegué.', answers: ['They were talking when I arrived', 'They were speaking when I arrived'], explanation: 'La conversación estaba en progreso cuando ocurrió otra acción.' },
    ],
  },
  {
    id: 'past-perfect', level: 'advanced', period: 'past', title: 'Past Perfect',
    summary: 'Una acción que ocurrió antes de otra acción pasada.',
    structure: 'Con todos los sujetos: usa had + participio pasado',
    rules: ['Aclara cuál de dos hechos pasados ocurrió primero.', 'Had es igual para todos los sujetos.'],
    examples: [
      ['The train had left when we arrived.', 'El tren ya había salido cuando llegamos.'],
      ['She had never seen snow before.', 'Nunca había visto nieve antes.'],
    ],
    questions: [
      { prompt: 'Completa: By the time I called, they ___ (leave).', answers: ['had left'], explanation: 'Ellos se fueron antes de la llamada: had left.' },
      { prompt: 'Traduce: Ya había terminado el informe.', answers: ['I had already finished the report', "I'd already finished the report"], explanation: 'Had + finished marca la acción anterior.' },
      { prompt: 'Completa: We ___ (eat) before the movie started.', answers: ['had eaten'], explanation: 'La comida ocurrió antes del comienzo de la película.' },
      { prompt: 'Traduce: Ella se había ido antes de mi llegada.', answers: ['She had left before I arrived', "She'd left before I arrived", 'She had gone before I arrived', "She'd gone before I arrived"], explanation: 'Had left o had gone indica la acción que ocurrió primero.' },
    ],
  },
  {
    id: 'future-perfect', level: 'advanced', period: 'future', title: 'Future Perfect',
    summary: 'Una acción que estará terminada antes de un momento futuro.',
    structure: 'Con todos los sujetos: usa will have + participio pasado',
    rules: ['Suele aparecer con by, before o by the time.', 'El punto de referencia debe estar en el futuro.'],
    examples: [
      ['I will have finished by Friday.', 'Habré terminado para el viernes.'],
      ['They will have arrived before noon.', 'Habrán llegado antes del mediodía.'],
    ],
    questions: [
      { prompt: 'Completa: By next month, she ___ (complete) the course.', answers: ['will have completed'], explanation: 'Estará terminado antes del próximo mes.' },
      { prompt: 'Traduce: Para las seis, habremos llegado.', answers: ['By six, we will have arrived', "By six, we'll have arrived"], explanation: 'Will have + arrived expresa el resultado futuro.' },
      { prompt: 'Completa: By the end of the year, I ___ (save) enough money.', answers: ['will have saved'], explanation: 'El ahorro estará completo antes de terminar el año.' },
      { prompt: 'Traduce: Para mañana, habrás recibido mi correo.', answers: ['By tomorrow, you will have received my email', "By tomorrow, you'll have received my email"], explanation: 'Will have received expresa un resultado completado antes de mañana.' },
    ],
  },
  {
    id: 'present-perfect-continuous', level: 'advanced', period: 'present', title: 'Present Perfect Continuous',
    summary: 'Una actividad que comenzó antes y continúa o acaba de terminar.',
    structure: 'Con I, you, we y they: usa have been + verbo terminado en -ing\nCon he, she e it: usa has been + verbo terminado en -ing',
    rules: ['Enfatiza la duración o continuidad de una actividad.', 'Usa for para una duración y since para indicar cuándo comenzó.'],
    examples: [
      ['I have been studying for two hours.', 'He estado estudiando durante dos horas.'],
      ['She has been working here since May.', 'Ella ha estado trabajando aquí desde mayo.'],
    ],
    questions: [
      { prompt: 'Completa: We ___ (wait) for over an hour.', answers: ['have been waiting'], explanation: 'La espera comenzó antes y continúa: have been waiting.' },
      { prompt: 'Traduce: Ha estado lloviendo toda la mañana.', answers: ['It has been raining all morning', "It's been raining all morning"], explanation: 'Usamos has been + raining para enfatizar la duración.' },
      { prompt: 'Completa: She ___ (learn) English since January.', answers: ['has been learning'], explanation: 'La actividad comenzó en enero y continúa: has been learning.' },
      { prompt: 'Traduce: He estado leyendo desde las ocho.', answers: ['I have been reading since eight', "I've been reading since eight", "I have been reading since eight o'clock", "I've been reading since eight o'clock"], explanation: 'Since indica el momento en que comenzó la actividad.' },
    ],
  },
  {
    id: 'past-perfect-continuous', level: 'advanced', period: 'past', title: 'Past Perfect Continuous',
    summary: 'La duración de una actividad anterior a otro momento pasado.',
    structure: 'Con todos los sujetos: usa had been + verbo terminado en -ing',
    rules: ['Describe una actividad continua anterior a otro hecho pasado.', 'Suele explicar la causa de una situación en el pasado.'],
    examples: [
      ['They had been traveling all day.', 'Habían estado viajando todo el día.'],
      ['He was tired because he had been running.', 'Estaba cansado porque había estado corriendo.'],
    ],
    questions: [
      { prompt: 'Completa: She was tired because she ___ (work) all night.', answers: ['had been working'], explanation: 'La actividad prolongada explica cómo se sentía: had been working.' },
      { prompt: 'Traduce: Habíamos estado hablando durante horas.', answers: ['We had been talking for hours', "We'd been talking for hours"], explanation: 'Had been + talking expresa duración anterior.' },
      { prompt: 'Completa: They ___ (wait) for thirty minutes before the bus arrived.', answers: ['had been waiting'], explanation: 'La espera duró hasta que llegó el autobús.' },
      { prompt: 'Traduce: Él había estado estudiando antes del examen.', answers: ['He had been studying before the exam', "He'd been studying before the exam"], explanation: 'Had been studying describe la actividad anterior al examen.' },
    ],
  },
  {
    id: 'future-continuous', level: 'advanced', period: 'future', title: 'Future Continuous',
    summary: 'Una acción que estará en progreso en un momento futuro.',
    structure: 'Con todos los sujetos: usa will be + verbo terminado en -ing',
    rules: ['Sitúa una actividad en desarrollo en un punto del futuro.', 'También permite preguntar por planes de manera más neutral.'],
    examples: [
      ['This time tomorrow, I will be flying.', 'Mañana a esta hora estaré volando.'],
      ['Will you be using the car tonight?', '¿Estarás usando el auto esta noche?'],
    ],
    questions: [
      { prompt: 'Completa: At ten tomorrow, I ___ (take) my exam.', answers: ['will be taking'], explanation: 'La acción estará desarrollándose a esa hora.' },
      { prompt: 'Traduce: Estaremos trabajando toda la tarde.', answers: ['We will be working all afternoon', "We'll be working all afternoon"], explanation: 'Will be + working describe la actividad futura en progreso.' },
      { prompt: 'Completa: This time next week, we ___ (travel) through Europe.', answers: ['will be traveling', 'will be travelling'], explanation: 'El viaje estará desarrollándose la próxima semana.' },
      { prompt: 'Traduce: Mañana a esta hora estaré durmiendo.', answers: ['This time tomorrow, I will be sleeping', "This time tomorrow, I'll be sleeping", 'Tomorrow at this time, I will be sleeping', "Tomorrow at this time, I'll be sleeping"], explanation: 'Will be sleeping sitúa la acción en progreso mañana a esta hora.' },
    ],
  },
  {
    id: 'future-perfect-continuous', level: 'advanced', period: 'future', title: 'Future Perfect Continuous',
    summary: 'La duración acumulada de una actividad hasta un momento futuro.',
    structure: 'Con todos los sujetos: usa will have been + verbo terminado en -ing',
    rules: ['Enfatiza cuánto tiempo llevará ocurriendo una actividad.', 'Normalmente incluye un punto futuro y una expresión de duración.'],
    examples: [
      ['By June, I will have been living here for a year.', 'En junio llevaré un año viviendo aquí.'],
      ['She will have been studying for five hours.', 'Llevará cinco horas estudiando.'],
    ],
    questions: [
      { prompt: 'Completa: By noon, they ___ (drive) for six hours.', answers: ['will have been driving'], explanation: 'Se destaca la duración acumulada hasta el mediodía.' },
      { prompt: 'Traduce: En diciembre, llevaré diez años trabajando aquí.', answers: ['By December, I will have been working here for ten years', "By December, I'll have been working here for ten years"], explanation: 'Will have been + working expresa duración hasta un punto futuro.' },
      { prompt: 'Completa: Next month, he ___ (teach) here for ten years.', answers: ['will have been teaching'], explanation: 'El próximo mes se cumplirán diez años de una actividad continua.' },
      { prompt: 'Traduce: En junio, llevarán un año viviendo juntos.', answers: ['By June, they will have been living together for a year', "By June, they'll have been living together for a year"], explanation: 'Will have been living expresa la duración acumulada hasta junio.' },
    ],
  },
];
