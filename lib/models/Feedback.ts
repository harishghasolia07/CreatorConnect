import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  briefId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  timestamp: Date;
}

const FeedbackSchema: Schema = new Schema({
  briefId: { type: Schema.Types.ObjectId, ref: 'Brief', required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);