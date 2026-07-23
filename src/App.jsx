import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useStats } from './hooks/useStats';
import PracticeView  from './components/PracticeView';
import ProgressView  from './components/ProgressView';
import MistakesView  from './components/MistakesView';

const VIEWS = [
  { id: 'practice', icon: '✦', label: 'Practicar' },
  { id: 'progress', icon: '◎', label: 'Progreso' },
  { id: 'mistakes', icon: '↺', label: 'Frases difíciles' },
];

const PAGE_TITLES = {
  practice: 'Construye la frase en inglés',
  progress: 'Tu progreso de aprendizaje',
  mistakes: 'Convierte errores en aprendizaje',
};

function Shell() {
  const [view, setView] = useState('practice');
  const { dark, toggleTheme } = useTheme();
  const { stats } = useStats();

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">T</div>
            <div>
              <p className="eyebrow">ENTRENADOR ACTIVO</p>
              <span className="brand-name">Think in English</span>
            </div>
          </div>

          <nav className="nav-list" aria-label="Navegación principal">
            {VIEWS.map(({ id, icon, label }) => (
              <button
                key={id}
                className={`nav-item${view === id ? ' active' : ''}`}
                onClick={() => setView(id)}
                aria-current={view === id ? 'page' : undefined}
              >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-card">
          <p className="eyebrow">RACHA ACTUAL</p>
          <div className="streak-row">
            <span className="streak-icon">🔥</span>
            <div>
              <span className="streak-label">
                {stats.streak} {stats.streak === 1 ? 'día' : 'días'}
              </span>
              <p className="streak-sub">Sigue practicando</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PRODUCCIÓN ACTIVA</p>
            <h2>{PAGE_TITLES[view]}</h2>
          </div>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {dark ? '☀' : '☾'}
          </button>
        </header>

        {view === 'practice' && <PracticeView />}
        {view === 'progress' && <ProgressView />}
        {view === 'mistakes' && <MistakesView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
