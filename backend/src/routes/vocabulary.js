import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { VocabularyItem } from '../models/VocabularyItem.js';

export const vocabularyRouter = Router();
vocabularyRouter.use(requireAuth);

const itemSchema = z.object({
  english: z.string().trim().min(1, 'Escribe la palabra o frase en inglés antes de guardarla.').max(300, 'El texto en inglés es demasiado largo.'),
  spanish: z.string().trim().min(1, 'Escribe el significado en español antes de guardarlo.').max(300, 'El texto en español es demasiado largo.'),
  context: z.string().trim().max(1000).default(''),
  type: z.enum(['word', 'phrase']).default('word'),
});
const normalize = (value) => value.trim().toLocaleLowerCase('en');
const serialize = (item) => ({
  id: item.id, english: item.english, spanish: item.spanish, context: item.context,
  type: item.type, attempts: item.attempts, correct: item.correct, createdAt: item.createdAt,
});

vocabularyRouter.get('/', async (req, res) => {
  const items = await VocabularyItem.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ items: items.map(serialize) });
});

vocabularyRouter.post('/', async (req, res) => {
  const input = itemSchema.parse(req.body);
  const item = await VocabularyItem.create({
    ...input, userId: req.userId, normalizedEnglish: normalize(input.english),
  });
  res.status(201).json({ item: serialize(item) });
});

vocabularyRouter.post('/import', async (req, res) => {
  const input = z.object({ items: z.array(itemSchema.extend({
    attempts: z.number().int().min(0).default(0),
    correct: z.number().int().min(0).default(0),
  })).max(1000) }).parse(req.body);
  if (!input.items.length) return res.json({ imported: 0 });
  const operations = input.items.map((item) => ({ updateOne: {
    filter: { userId: req.userId, normalizedEnglish: normalize(item.english) },
    update: { $setOnInsert: { ...item, userId: req.userId, normalizedEnglish: normalize(item.english) } },
    upsert: true,
  } }));
  const result = await VocabularyItem.bulkWrite(operations, { ordered: false });
  return res.json({ imported: result.upsertedCount });
});

vocabularyRouter.patch('/:id', async (req, res) => {
  const input = itemSchema.partial().parse(req.body);
  const update = { ...input };
  if (input.english) update.normalizedEnglish = normalize(input.english);
  const item = await VocabularyItem.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId }, update, { new: true, runValidators: true },
  );
  if (!item) return res.status(404).json({ message: 'Vocabulario no encontrado.' });
  return res.json({ item: serialize(item) });
});

vocabularyRouter.post('/:id/attempts', async (req, res) => {
  const { correct } = z.object({ correct: z.boolean() }).parse(req.body);
  const item = await VocabularyItem.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $inc: { attempts: 1, correct: correct ? 1 : 0 } }, { new: true },
  );
  if (!item) return res.status(404).json({ message: 'Vocabulario no encontrado.' });
  return res.json({ item: serialize(item) });
});

vocabularyRouter.delete('/:id', async (req, res) => {
  const item = await VocabularyItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!item) return res.status(404).json({ message: 'Vocabulario no encontrado.' });
  return res.status(204).end();
});
