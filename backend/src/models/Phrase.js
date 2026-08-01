import mongoose from 'mongoose';

const phraseSchema = new mongoose.Schema({
  sourceId: { type: Number, required: true, unique: true },
  category: { type: String, required: true, trim: true, index: true },
  level: { type: Number, required: true, min: 1, max: 5, index: true },
  spanish: { type: String, required: true, trim: true },
  answers: [{ type: String, required: true, trim: true }],
  hint: { type: String, trim: true, default: '' },
  note: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

phraseSchema.index({ category: 1, level: 1, isActive: 1 });

export const Phrase = mongoose.model('Phrase', phraseSchema);
