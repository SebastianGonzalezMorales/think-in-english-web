# Think in English

Entrenador de traducción activa español → inglés. El objetivo no es memorizar listas de vocabulario sino obligarte a **construir la frase completa**, igual que lo harías en una conversación real.

![Vista práctica](https://placehold.co/900x480/5b5ce2/ffffff?text=Think+in+English)

---

## ¿Por qué existe este proyecto?

La mayoría de las apps de idiomas te piden que reconozcas palabras o completes frases a medias. Eso entrena la comprensión, pero no la producción. Este proyecto parte de una premisa distinta:

> **Leer inglés y hablarlo son habilidades diferentes. Para hablar, hay que practicar hablar.**

Cada ejercicio te muestra una frase en español y tú debes escribir la traducción completa desde cero. El sistema evalúa tu respuesta, te explica los errores gramaticales y guarda las frases que más te cuestan para que puedas repasarlas.

---

## Funcionalidades

- **Traducción activa** — escribe la frase completa en inglés, sin ayuda de opciones múltiples
- **Evaluación inteligente** — combina comparación exacta con distancia de Levenshtein para aceptar variaciones naturales y contracciones (`I'm`, `couldn't`, etc.)
- **Retroalimentación inmediata** — versión recomendada, explicación gramatical y alternativas válidas
- **7 categorías** — Vida cotidiana, Trabajo, Tecnología, Viajes, Universidad, Entrevistas, Números
- **5 niveles de dificultad** — desde present simple hasta condicionales complejos y registro académico
- **Frases difíciles** — las respuestas incorrectas se guardan automáticamente para repetición inteligente
- **Progreso por categoría** — precisión, total de frases respondidas y racha diaria
- **Modo oscuro** — persistido entre sesiones
- **Sin backend** — todo corre en el navegador con `localStorage`

---

## Stack

| Herramienta | Uso |
|---|---|
| React 18 | UI y manejo de estado |
| Vite 5 | Bundler y dev server |
| CSS custom properties | Theming (modo claro/oscuro) |
| localStorage | Persistencia de progreso |

Sin librerías de componentes, sin CSS frameworks — todo el diseño está hecho a mano.

---

## Estructura del proyecto

```
src/
├── App.jsx                  # Shell principal, sidebar, navegación
├── main.jsx                 # Entry point
├── styles/
│   └── global.css           # Tokens de diseño y componentes CSS
├── context/
│   └── ThemeContext.jsx      # Modo oscuro / claro
├── hooks/
│   └── useStats.js          # Estado de progreso y localStorage
├── data/
│   └── phraseBank.js        # Banco de 32 frases con hints y notas
├── utils/
│   └── utils.js             # Levenshtein, normalización, evaluación
└── components/
    ├── PracticeView.jsx     # Vista principal de ejercicios
    ├── ProgressView.jsx     # Métricas y progreso por categoría
    └── MistakesView.jsx     # Frases pendientes de refuerzo
```

---

## Cómo correrlo

```bash
# Clonar el repo
git clone https://github.com/SebastianGonzalezMorales/think-in-english-web.git
cd think-in-english-web

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en el navegador.

```bash
# Build de producción
npm run build
```

---

## Cómo funciona la evaluación

Cuando envías una respuesta, el sistema:

1. **Normaliza** ambos textos — expande contracciones, elimina puntuación, pasa a minúsculas
2. **Calcula similitud** usando distancia de Levenshtein contra todas las respuestas válidas de la frase
3. **Clasifica** el resultado en tres niveles:
   - ✅ **Correcto** — similitud ≥ 90% o coincidencia exacta
   - 🟡 **Casi correcto** — similitud entre 67% y 90%
   - ❌ **Necesita revisión** — similitud < 67%
4. **Muestra** la versión recomendada, las palabras faltantes y una explicación gramatical

---

## Roadmap

- [ ] Más frases en cada categoría
- [ ] Modo audio — escuchar la frase en lugar de leerla
- [ ] Exportar progreso
- [ ] Soporte para otros pares de idiomas
- [ ] PWA para uso offline

---

## Licencia

MIT
