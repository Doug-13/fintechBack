import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const themePrefsSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  language: { type: String, default: 'pt-BR' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  photoUrl: { type: String, default: null },
  preferences: { type: themePrefsSchema, default: () => ({}) },
  roles: [{ type: String, default: [] }],
  
  // ↓↓↓ novo bloco
  passwordReset: {
    codeHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
  },
}, { timestamps: true });

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

export const User = mongoose.model('User', userSchema);
