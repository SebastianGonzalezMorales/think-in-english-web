# Think in English

Entrenador de traducción activa español → inglés. El objetivo no es memorizar listas de vocabulario sino obligarte a **construir la frase completa**, igual que lo harías en una conversación real.

![Vista práctica](https://placehold.co/900x480/5b5ce2/ffffff?text=Think+in+English)

---

## ¿Por qué existe este proyecto?

Muchas aplicaciones de idiomas son útiles para comenzar, pero suelen concentrarse en vocabulario básico, ejercicios de reconocimiento y frases a medio completar. Cuando ya tienes un nivel intermedio, eso no siempre es suficiente para seguir avanzando hasta comprender el inglés con naturalidad y expresar ideas propias.

Este proyecto nace para entrenar una habilidad diferente:

> **No quiero limitarme a reconocer el inglés: quiero aprender a construirlo, pensar en él y expresarme con naturalidad.**

Cada ejercicio te presenta una idea en español y te pide escribirla completamente en inglés, sin depender de alternativas ni frases ya construidas. Ese esfuerzo te obliga a recordar vocabulario, elegir la estructura adecuada y acostumbrarte a formular pensamientos por tu cuenta. El sistema evalúa la respuesta, entrega una explicación y guarda las frases que más cuestan para poder repasarlas.

Por ahora, Think in English se concentra en la escritura como una forma deliberada de aprender a pensar en inglés y dejar atrás la traducción automática palabra por palabra. La práctica oral puede convertirse más adelante en el siguiente paso: llevar esa misma capacidad de construir ideas a una conversación real.

---

## Funcionalidades

- **Traducción activa** — escribe frases completas en inglés desde cero, sin depender de alternativas
- **Evaluación inteligente** — combina comparación exacta y similitud para aceptar variaciones naturales y contracciones (`I'm`, `couldn't`, etc.)
- **Retroalimentación inmediata** — muestra una respuesta recomendada, una explicación gramatical y alternativas válidas
- **Práctica por categorías y dificultad** — trabaja con situaciones de la vida cotidiana, el trabajo, la tecnología, los viajes, la universidad y otros contextos reales
- **Tiempos verbales** — estudia y practica estructuras de presente, pasado y futuro, desde fundamentos hasta contenidos avanzados
- **Práctica separada del verbo _to be_** — distingue _am/is/are_ y _was/were_ de los verbos de acción en Present Simple y Past Simple
- **Preposiciones** — aprende preposiciones de lugar, tiempo y movimiento mediante explicaciones, ejemplos y actividades
- **Resumen de práctica** — al terminar un recorrido muestra el puntaje, los aciertos y las respuestas que conviene repasar
- **Último resultado** — conserva localmente el porcentaje más reciente de cada práctica de Present Simple y Past Simple
- **Frases difíciles** — guarda automáticamente las respuestas incorrectas para volver a practicarlas
- **Vocabulario personal** — permite guardar palabras nuevas, su significado y una frase de contexto
- **Frases personales** — permite crear una colección propia y practicarla en ambas direcciones
- **Práctica bidireccional** — practica inglés → español, español → inglés o ambas direcciones mezcladas
- **Seguimiento del aprendizaje** — muestra precisión, actividad acumulada y racha de estudio
- **Navegación con rutas** — cada sección principal tiene su propia URL y se conserva al recargar la página
- **Modo oscuro** — mantiene la preferencia visual entre sesiones
- **Cuentas personales** — utiliza autenticación con una sesión segura mediante cookie HttpOnly
- **Datos sincronizados** — almacena palabras y frases personales en MongoDB

---

## Stack

| Herramienta | Uso |
|---|---|
| React 18 | UI y manejo de estado |
| Vite 5 | Bundler y dev server |
| Node.js + Express | API REST |
| MongoDB Atlas + Mongoose | Persistencia multiusuario |
| CSS custom properties | Theming (modo claro/oscuro) |
| localStorage | Progreso local y migración inicial de vocabulario |

Sin librerías de componentes ni frameworks CSS; todo el diseño está hecho a mano.

## Configurar MongoDB y el backend

1. Crea un proyecto y un cluster en MongoDB Atlas.
2. Crea un usuario de base de datos y autoriza tu IP de desarrollo.
3. Copia `backend/.env.example` como `backend/.env` y completa `MONGODB_URI` y `JWT_SECRET`.
4. Usa un secreto aleatorio de al menos 32 caracteres para `JWT_SECRET`.

```bash
# Frontend y backend simultáneamente
pnpm dev

# También puedes iniciarlos por separado
pnpm dev:frontend
pnpm dev:backend
```

La aplicación corre en `http://localhost:5173` y Vite redirige `/api` a `http://localhost:3000` durante el desarrollo.

Para importar o actualizar el catálogo de `frontend/src/data/phraseBank.js` en MongoDB:

```bash
pnpm seed:phrases
```

El vocabulario existente en `localStorage` se importa automáticamente a la cuenta la primera vez que se inicia sesión. Solo se elimina la copia local después de una importación exitosa.

---

## Estructura del proyecto

```
frontend/
├── src/                     # Aplicación React
├── index.html
├── vite.config.js
└── package.json
backend/
├── src/
│   ├── middleware/          # Autenticación y manejo de errores
│   ├── models/              # Modelos de MongoDB
│   ├── routes/              # Endpoints de la API
│   ├── app.js
│   └── index.js
├── scripts/                 # Importación del catálogo
├── .env.example
└── package.json
package.json                 # Comandos del monorepo
pnpm-workspace.yaml          # Configuración del workspace
```

---

## Cómo correrlo

```bash
# Clonar el repo
git clone https://github.com/SebastianGonzalezMorales/think-in-english-web.git
cd think-in-english-web

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

Abre `http://localhost:5173` en el navegador.

```bash
# Build de producción
pnpm build
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
