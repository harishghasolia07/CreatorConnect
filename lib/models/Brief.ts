import mongoose, { Schema, Document } from 'mongoose';

export interface IBrief extends Document {
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
  };
  category: string;
  preferredStyles: string[];
  budgetMax: number;
  startDate: Date;
  endDate: Date;
  clientName: string;
  clientEmail: string;
  matches: Array<{
    creatorId: mongoose.Types.ObjectId;
    score: number;
    explanation: string[];
  }>;
}

const BriefSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  category: { type: String, required: true },
  preferredStyles: [{ type: String }],
  budgetMax: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  matches: [{
    creatorId: { type: Schema.Types.ObjectId, ref: 'Creator' },
    score: { type: Number },
    explanation: [{ type: String }]
  }]
}, {
  timestamps: true
});

export default mongoose.models.Brief || mongoose.model<IBrief>('Brief', BriefSchema);