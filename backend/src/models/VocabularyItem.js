import mongoose from 'mongoose';

const vocabularyItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  english: { type: String, required: true, trim: true, maxlength: 300 },
  normalizedEnglish: { type: String, required: true },
  spanish: { type: String, required: true, trim: true, maxlength: 300 },
  context: { type: String, trim: true, maxlength: 1000, default: '' },
  type: { type: String, enum: ['word', 'phrase'], default: 'word' },
  attempts: { type: Number, min: 0, default: 0 },
  correct: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

vocabularyItemSchema.index({ userId: 1, normalizedEnglish: 1 }, { unique: true });
vocabularyItemSchema.index({ userId: 1, createdAt: -1 });

export const VocabularyItem = mongoose.model('VocabularyItem', vocabularyItemSchema);
