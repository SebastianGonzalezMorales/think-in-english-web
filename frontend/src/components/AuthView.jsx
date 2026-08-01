import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthView() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'register') await register(form);
      else await login({ email: form.email, password: form.password });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <div className="brand-mark">T</div>
        <p className="eyebrow">THINK IN ENGLISH</p>
        <h1>{mode === 'login' ? 'Continúa aprendiendo' : 'Crea tu espacio personal'}</h1>
        <p className="auth-intro">Tu vocabulario quedará protegido y disponible en todos tus dispositivos.</p>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Ingresar</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Crear cuenta</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>Nombre
              <input className="text-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required minLength="2" autoComplete="name" />
            </label>
          )}
          <label>Correo
            <input className="text-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
          </label>
          <label>Contraseña
            <input className="text-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength="8" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </label>
          {error && <p className="form-message error">{error}</p>}
          <button className="btn-primary btn-full" disabled={submitting} type="submit">
            {submitting ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Crear mi cuenta'}
          </button>
        </form>
      </section>
    </main>
  );
}
