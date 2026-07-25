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
  const [collapsed,   setCollapsed]   = useState(false);
  const [reviewQueue, setReviewQueue] = useState(null);
  const { dark, toggleTheme } = useTheme();
  const { stats } = useStats();

  const startReview = (ids) => { setReviewQueue(ids); setView('review'); };
  const handleNavClick = (id) => { setReviewQueue(null); setView(id); };
  const activeNav = view === 'review' ? 'mistakes' : view;

  return (
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div>
          {/* Brand — hidden when collapsed */}
          <div className="sidebar-header">
            {!collapsed && (
              <div className="brand">
                <div className="brand-mark">T</div>
                <div>
                  <p className="eyebrow">ENTRENADOR ACTIVO</p>
                  <span className="brand-name">Think in English</span>
                </div>
              </div>
            )}
            <button
              className="collapse-btn"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          <nav className="nav-list" aria-label="Navegación principal">
            {VIEWS.map(({ id, icon, label }) => (
              <button
                key={id}
                className={`nav-item${activeNav === id ? ' active' : ''}`}
                onClick={() => handleNavClick(id)}
                aria-current={activeNav === id ? 'page' : undefined}
                title={collapsed ? label : undefined}
              >
                <span className="nav-icon">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {!collapsed && (
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
        )}

        {/* Streak icon-only when collapsed */}
        {collapsed && (
          <div className="streak-icon-only" title={`${stats.streak} ${stats.streak === 1 ? 'día' : 'días'} de racha`}>
            🔥
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <header className="topbar">
          <div className="page-heading">
            <span className="page-kicker">PRODUCCIÓN ACTIVA</span>
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
