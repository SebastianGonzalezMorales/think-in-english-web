import { Router } from 'express';
import { z } from 'zod';
import { Phrase } from '../models/Phrase.js';

export const phrasesRouter = Router();

phrasesRouter.get('/', async (req, res) => {
  const query = z.object({
    category: z.string().optional(),
    level: z.coerce.number().int().min(1).max(5).optional(),
  }).parse(req.query);
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.level) filter.level = query.level;
  const phrases = await Phrase.find(filter).sort({ sourceId: 1 }).lean();
  res.json({ phrases });
});
