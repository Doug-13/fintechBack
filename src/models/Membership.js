import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Types.ObjectId, ref: 'Organization', index: true, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', index: true, required: true },
  modules: [{ type: String }], // dynamic modules the user can access
  permissions: {              
    type: Map,
    of: new mongoose.Schema({
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false }
    }, { _id: false })
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

membershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export const Membership = mongoose.model('Membership', membershipSchema);
