import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useStats } from './hooks/useStats';
import PracticeView from './components/PracticeView';
import ProgressView from './components/ProgressView';
import MistakesView from './components/MistakesView';
import VocabularyView from './components/VocabularyView';
import VocabularyPracticeView from './components/VocabularyPracticeView';
import TensesView from './components/TensesView';
import AuthView from './components/AuthView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VocabularyProvider } from './hooks/useVocabulary';

const VIEWS = [
  { id: 'practice', icon: '✦', label: 'Practicar' },
  { id: 'progress', icon: '◎', label: 'Progreso' },
  { id: 'mistakes', icon: '↺', label: 'Frases difíciles' },
  { id: 'vocabulary', icon: 'Aa', label: 'Mis palabras' },
  { id: 'vocabulary-practice', icon: '⇄', label: 'Practicar palabras' },
  { id: 'my-phrases', icon: '“”', label: 'Mis frases' },
  { id: 'phrases-practice', icon: '↔', label: 'Practicar frases' },
  { id: 'tenses', icon: 'T°', label: 'Tiempos verbales' },
];

const PAGE_TITLES = {
  practice: 'Construye la frase en inglés',
  review:   'Repasando frases difíciles',
  progress: 'Tu progreso de aprendizaje',
  mistakes: 'Convierte errores en aprendizaje',
  vocabulary: 'Construye tu vocabulario personal',
  'vocabulary-practice': 'Practica tus palabras',
  'my-phrases': 'Construye tu colección de frases',
  'phrases-practice': 'Practica tus frases',
  tenses: 'Comprende y usa los tiempos verbales',
};

function Shell() {
  const [view,        setView]        = useState('practice');
  const [collapsed,   setCollapsed]   = useState(false);
  const [reviewQueue, setReviewQueue] = useState(null);
  const { dark, toggleTheme } = useTheme();
  const { stats } = useStats();
  const { user, logout } = useAuth();

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
            <div className="mobile-brand">
              <div className="brand-mark">T</div>
              <div>
                <p className="eyebrow">ENTRENADOR ACTIVO</p>
                <span className="brand-name">Think in English</span>
              </div>
            </div>
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
            <div className="mobile-account-actions">
              <button className="btn-account" onClick={logout}>Salir</button>
              <button className="icon-button" onClick={toggleTheme} aria-label="Cambiar tema">
                {dark ? '☀' : '☾'}
              </button>
            </div>
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
          <div className="account-actions">
            <span>{user.displayName}</span>
            <button className="btn-account" onClick={logout}>Salir</button>
            <button className="icon-button" onClick={toggleTheme} aria-label="Cambiar tema">{dark ? '☀' : '☾'}</button>
          </div>
        </header>

        {(view === 'practice' || view === 'review') && (
          <PracticeView
            reviewQueue={reviewQueue}
            onReviewDone={() => { setReviewQueue(null); setView('mistakes'); }}
          />
        )}
        {view === 'progress' && <ProgressView />}
        {view === 'mistakes' && <MistakesView onStartReview={startReview} />}
        {view === 'vocabulary' && <VocabularyView />}
        {view === 'my-phrases' && <VocabularyView itemType="phrase" />}
        {view === 'vocabulary-practice' && (
          <VocabularyPracticeView onGoToVocabulary={() => setView('vocabulary')} />
        )}
        {view === 'phrases-practice' && (
          <VocabularyPracticeView
            itemType="phrase"
            onGoToVocabulary={() => setView('my-phrases')}
          />
        )}
        {view === 'tenses' && <TensesView />}
      </main>
    </div>
  );
}

function SessionApp() {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Cargando…</div>;
  if (!user) return <AuthView />;
  return <VocabularyProvider><Shell /></VocabularyProvider>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SessionApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
