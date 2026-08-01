import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'englishTrainerStats';

const DEFAULT_STATS = {
  answered: 0,
  correct: 0,
  categories: {},
  mistakes: [],
  lastPractice: null,
  streak: 1,
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveToStorage(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch { /* ignore */ }
}

function computeStreak(stats) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  if (!stats.lastPractice) {
    stats.streak = 1;
  } else if (stats.lastPractice !== todayKey) {
    const prev = new Date(stats.lastPractice + 'T00:00:00');
    const diff = Math.round((today - prev) / 86_400_000);
    stats.streak = diff === 1 ? (stats.streak || 1) + 1 : 1;
  }
  stats.lastPractice = todayKey;
  return stats;
}

export function useStats() {
  const [stats, setStats] = useState(loadFromStorage);

  // Persist on every change
  useEffect(() => { saveToStorage(stats); }, [stats]);

  const recordAnswer = useCallback((phrase, correct, userAnswer) => {
    setStats((prev) => {
      const next = structuredClone(prev);
      next.answered += 1;
      if (correct) next.correct += 1;

      next.categories[phrase.category] ??= { answered: 0, correct: 0 };
      next.categories[phrase.category].answered += 1;
      if (correct) next.categories[phrase.category].correct += 1;

      if (!correct) {
        const existing = next.mistakes.find((m) => m.id === phrase.id);
        if (existing) {
          existing.attempts += 1;
          existing.lastAnswer = userAnswer;
        } else {
          next.mistakes.unshift({ id: phrase.id, attempts: 1, lastAnswer: userAnswer });
        }
      } else {
        next.mistakes = next.mistakes.filter((m) => m.id !== phrase.id);
      }

      computeStreak(next);
      return next;
    });
  }, []);

  const clearMistakes = useCallback(() => {
    setStats((prev) => ({ ...prev, mistakes: [] }));
  }, []);

  return { stats, recordAnswer, clearMistakes };
}
