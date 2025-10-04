import mongoose from 'mongoose';

const orgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  logoUrl: { type: String, default: null }, // stored in object storage
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Organization = mongoose.model('Organization', orgSchema);
