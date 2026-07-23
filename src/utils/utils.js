export function normalize(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/\b(i'm)\b/g, 'i am')
    .replace(/\b(i've)\b/g, 'i have')
    .replace(/\b(i'd)\b/g, 'i would')
    .replace(/\b(i'll)\b/g, 'i will')
    .replace(/\b(we've)\b/g, 'we have')
    .replace(/\b(we're)\b/g, 'we are')
    .replace(/\b(we'll)\b/g, 'we will')
    .replace(/\b(couldn't)\b/g, 'could not')
    .replace(/\b(didn't)\b/g, 'did not')
    .replace(/\b(wasn't)\b/g, 'was not')
    .replace(/\b(isn't)\b/g, 'is not')
    .replace(/\b(where's)\b/g, 'where is')
    .replace(/[^a-z0-9\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[b.length][a.length];
}

export function similarity(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
}

export function evaluateAnswer(input, phrase) {
  const scores = phrase.answers.map((answer) => ({ answer, score: similarity(input, answer) }));
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const normalizedInput = normalize(input);
  const exact = phrase.answers.some((a) => normalize(a) === normalizedInput);

  let result = 'error';
  if (exact || best.score >= 0.9) result = 'success';
  else if (best.score >= 0.67) result = 'partial';

  const expectedWords = new Set(normalize(best.answer).split(' '));
  const inputWords = new Set(normalizedInput.split(' '));
  const missing = [...expectedWords]
    .filter((w) => !inputWords.has(w) && w.length > 2)
    .slice(0, 5);

  return { result, best, missing };
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
