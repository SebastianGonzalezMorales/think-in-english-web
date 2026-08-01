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
- **Vocabulario personal** — guarda palabras nuevas, su significado y una frase de contexto
- **Práctica bidireccional de palabras** — practica inglés → español, español → inglés o ambas direcciones mezcladas
- **Progreso por categoría** — precisión, total de frases respondidas y racha diaria
- **Modo oscuro** — persistido entre sesiones
- **Cuentas personales** — autenticación mediante una sesión segura en cookie HttpOnly
- **Vocabulario sincronizado** — palabras y frases personales almacenadas en MongoDB

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
