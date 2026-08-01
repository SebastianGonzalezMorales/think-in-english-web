import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'englishTrainerVocabulary';
const VocabularyContext = createContext(null);

function localWords() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

export function VocabularyProvider({ children }) {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const pending = localWords();
      if (pending.length) {
        await api('/vocabulary/import', { method: 'POST', body: JSON.stringify({ items: pending }) });
        localStorage.removeItem(STORAGE_KEY);
      }
      const data = await api('/vocabulary');
      setWords(data.items);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addWord = useCallback(async ({ english, spanish, context, type = 'word' }) => {
    try {
      const data = await api('/vocabulary', {
        method: 'POST', body: JSON.stringify({ english, spanish, context, type }),
      });
      setWords((current) => [data.item, ...current]);
      return { ok: true };
    } catch (requestError) {
      return { ok: false, reason: requestError.message.includes('existe') ? 'duplicate' : 'server', message: requestError.message };
    }
  }, []);

  const removeWord = useCallback(async (id) => {
    await api(`/vocabulary/${id}`, { method: 'DELETE' });
    setWords((current) => current.filter((word) => word.id !== id));
  }, []);

  const recordAttempt = useCallback(async (id, correct) => {
    setWords((current) => current.map((word) => word.id === id
      ? { ...word, attempts: word.attempts + 1, correct: word.correct + (correct ? 1 : 0) }
      : word));
    try {
      await api(`/vocabulary/${id}/attempts`, { method: 'POST', body: JSON.stringify({ correct }) });
    } catch { refresh(); }
  }, [refresh]);

  const value = useMemo(() => ({ words, loading, error, addWord, removeWord, recordAttempt, refresh }),
    [words, loading, error, addWord, removeWord, recordAttempt, refresh]);
  return createElement(VocabularyContext.Provider, { value }, children);
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (!context) throw new Error('useVocabulary debe usarse dentro de VocabularyProvider');
  return context;
}
