export function normalize(text) {
  return text
    .toLowerCase()
    // Accept the apostrophe variants commonly produced by Spanish keyboards.
    .replace(/[\u2018\u2019\u00b4\u0060\u02bc]/g, "'")
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

export function describeCorrection(input, expected) {
  const inputWords = normalize(input).split(' ').filter(Boolean);
  const expectedWords = normalize(expected).split(' ').filter(Boolean);
  let start = 0;
  while (start < inputWords.length && start < expectedWords.length && inputWords[start] === expectedWords[start]) start += 1;

  let inputEnd = inputWords.length - 1;
  let expectedEnd = expectedWords.length - 1;
  while (inputEnd >= start && expectedEnd >= start && inputWords[inputEnd] === expectedWords[expectedEnd]) {
    inputEnd -= 1;
    expectedEnd -= 1;
  }

  const written = inputWords.slice(start, inputEnd + 1).join(' ');
  const replacement = expectedWords.slice(start, expectedEnd + 1).join(' ');
  if (written && replacement) return `“${written}” → “${replacement}”`;
  if (replacement) return `Falta “${replacement}”`;
  if (written) return `Quita “${written}”`;
  return null;
}

const STRICT_GRAMMAR_WORDS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'a', 'an', 'the', 'this', 'that',
  'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'can', 'could',
  'should', 'may', 'might', 'must', 'not', 'no', 'yes', 'to', 'of', 'in', 'on',
  'at', 'for', 'from', 'with', 'by', 'about', 'into', 'through', 'before', 'after',
  'and', 'or', 'but', 'if', 'because', 'who', 'what', 'where', 'when', 'why', 'how',
]);

function isAdjacentTransposition(first, second) {
  if (first.length !== second.length) return false;
  const differences = [];
  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) differences.push(index);
  }
  return differences.length === 2
    && differences[1] === differences[0] + 1
    && first[differences[0]] === second[differences[1]]
    && first[differences[1]] === second[differences[0]];
}

export function isAcceptableTypo(input, expected) {
  const inputWords = normalize(input).split(' ').filter(Boolean);
  const expectedWords = normalize(expected).split(' ').filter(Boolean);
  if (inputWords.length !== expectedWords.length) return false;
  const differences = inputWords
    .map((word, index) => [word, expectedWords[index]])
    .filter(([word, expectedWord]) => word !== expectedWord);
  if (differences.length !== 1) return false;

  const [written, correct] = differences[0];
  if (written.length < 4 || correct.length < 4) return false;
  if (STRICT_GRAMMAR_WORDS.has(written) || STRICT_GRAMMAR_WORDS.has(correct)) return false;
  const shorter = written.length < correct.length ? written : correct;
  const longer = written.length < correct.length ? correct : written;
  if ([`${shorter}s`, `${shorter}d`].includes(longer)) return false;
  return levenshtein(written, correct) === 1 || isAdjacentTransposition(written, correct);
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
