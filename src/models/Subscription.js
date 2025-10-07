import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Types.ObjectId, ref: 'Organization', required: true },
  planId: { type: mongoose.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  status: { type: String, enum: ['active','past_due','canceled'], default: 'active' },
  validUntil: { type: Date, required: true }
}, { timestamps: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
