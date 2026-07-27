import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'englishTrainerVocabulary';

function loadVocabulary() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveVocabulary(words) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch { /* ignore */ }
}

function createId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `word-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useVocabulary() {
  const [words, setWords] = useState(loadVocabulary);

  useEffect(() => { saveVocabulary(words); }, [words]);

  const addWord = useCallback(({ english, spanish, context }) => {
    const cleanEnglish = english.trim();
    const cleanSpanish = spanish.trim();
    if (!cleanEnglish || !cleanSpanish) return { ok: false, reason: 'empty' };

    const exists = words.some(
      (word) => word.english.toLocaleLowerCase() === cleanEnglish.toLocaleLowerCase(),
    );
    if (exists) return { ok: false, reason: 'duplicate' };

    const newWord = {
      id: createId(),
      english: cleanEnglish,
      spanish: cleanSpanish,
      context: context.trim(),
      attempts: 0,
      correct: 0,
      createdAt: new Date().toISOString(),
    };
    setWords((current) => [newWord, ...current]);
    return { ok: true };
  }, [words]);

  const removeWord = useCallback((id) => {
    setWords((current) => current.filter((word) => word.id !== id));
  }, []);

  const recordAttempt = useCallback((id, correct) => {
    setWords((current) => current.map((word) => (
      word.id === id
        ? { ...word, attempts: word.attempts + 1, correct: word.correct + (correct ? 1 : 0) }
        : word
    )));
  }, []);

  return { words, addWord, removeWord, recordAttempt };
}
