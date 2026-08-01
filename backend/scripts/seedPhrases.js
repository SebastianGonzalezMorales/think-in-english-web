import mongoose from 'mongoose';
import { phraseBank } from '../../frontend/src/data/phraseBank.js';
import { config } from '../src/config.js';
import { Phrase } from '../src/models/Phrase.js';

await mongoose.connect(config.MONGODB_URI);
const operations = phraseBank.map((phrase) => ({ updateOne: {
  filter: { sourceId: phrase.id },
  update: { $set: {
    category: phrase.category, level: phrase.level, spanish: phrase.es,
    answers: phrase.answers, hint: phrase.hint, note: phrase.note, isActive: true,
  } },
  upsert: true,
} }));
const result = await Phrase.bulkWrite(operations);
console.log(`Catálogo sincronizado: ${result.upsertedCount} creadas, ${result.modifiedCount} actualizadas.`);
await mongoose.disconnect();
