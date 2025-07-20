import mongoose, { Schema, Document } from 'mongoose';
import { AI_CONFIG } from '../constants';

export interface ICreator extends Document {
  name: string;
  location: {
    city: string;
    country: string;
  };
  categories: string[];
  skills: string[];
  experienceYears: number;
  budgetRange: {
    min: number;
    max: number;
  };
  portfolio: Array<{
    url: string;
    tags: string[];
  }>;
  rating: number;
  bio: string;
  avatar?: string;
  // AI Enhancement: Store pre-computed embeddings for faster matching
  embedding?: number[];
  lastEmbeddingUpdate?: Date;
}

const CreatorSchema: Schema = new Schema({
  name: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  categories: [{ type: String }],
  skills: [{ type: String }],
  experienceYears: { type: Number, required: true },
  budgetRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  portfolio: [{
    url: { type: String },
    tags: [{ type: String }]
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  bio: { type: String, default: '' },
  avatar: { type: String },
  // AI Enhancement fields
  embedding: {
    type: [Number],
    required: false,
    validate: {
      validator: function (v: number[]) {
        return !v || v.length === AI_CONFIG.EMBEDDING_DIMENSIONS; // Use constant for validation
      },
      message: `Embedding must have exactly ${AI_CONFIG.EMBEDDING_DIMENSIONS} dimensions`
    }
  },
  lastEmbeddingUpdate: { type: Date }
}, {
  timestamps: true
});

export default mongoose.models.Creator || mongoose.model<ICreator>('Creator', CreatorSchema);