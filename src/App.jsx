import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useStats } from './hooks/useStats';
import PracticeView from './components/PracticeView';
import ProgressView from './components/ProgressView';
import MistakesView from './components/MistakesView';

const VIEWS = [
  { id: 'practice', icon: '✦', label: 'Practicar' },
  { id: 'progress', icon: '◎', label: 'Progreso' },
  { id: 'mistakes', icon: '↺', label: 'Frases difíciles' },
];

const PAGE_TITLES = {
  practice: 'Construye la frase en inglés',
  review:   'Repasando frases difíciles',
  progress: 'Tu progreso de aprendizaje',
  mistakes: 'Convierte errores en aprendizaje',
};

function Shell() {
  const [view,        setView]        = useState('practice');
  // reviewQueue holds phrase ids to practice when coming from MistakesView
  const [reviewQueue, setReviewQueue] = useState(null);
  const { dark, toggleTheme } = useTheme();
  const { stats } = useStats();

  // Called from MistakesView with the ids to review
  const startReview = (ids) => {
    setReviewQueue(ids);
    setView('review');
  };

  const handleNavClick = (id) => {
    setReviewQueue(null);
    setView(id);
  };

  const activeNav = view === 'review' ? 'mistakes' : view;

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
                className={`nav-item${activeNav === id ? ' active' : ''}`}
                onClick={() => handleNavClick(id)}
                aria-current={activeNav === id ? 'page' : undefined}
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
          <button className="icon-button" onClick={toggleTheme} aria-label="Cambiar tema">
            {dark ? '☀' : '☾'}
          </button>
        </header>

        {(view === 'practice' || view === 'review') && (
          <PracticeView
            reviewQueue={reviewQueue}
            onReviewDone={() => { setReviewQueue(null); setView('mistakes'); }}
          />
        )}
        {view === 'progress' && <ProgressView />}
        {view === 'mistakes' && <MistakesView onStartReview={startReview} />}
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
