import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  priceCents: { type: Number, required: true },
  currency: { type: String, default: 'BRL' },
  features: [{ type: String }],
  maxUsers: { type: Number, default: 5 },
  maxStorageMB: { type: Number, default: 512 }
}, { timestamps: true });

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', planSchema);
