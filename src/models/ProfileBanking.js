// src/models/ProfileBanking.js
import mongoose from "mongoose";

// Subdocumento Pix
const PixSchema = new mongoose.Schema({
  type: { type: String, enum: ["cpf_cnpj", "email", "phone", "random"], default: null },
  key: { type: String, default: null }
}, { _id: false });

// Subdocumento Banking
const BankingSchema = new mongoose.Schema({
  bankCode: { type: String, default: null },
  bankName: { type: String, default: null },
  agency: { type: String, default: null },
  account: { type: String, default: null },
  accountDigit: { type: String, default: null },
  accountType: { type: String, enum: ["corrente","poupanca","pagamento", null], default: null },
  pix: { type: PixSchema, default: null },
  consentLGPD: { type: Boolean, default: false }
}, { _id: false });

// Subdocumento Address
const AddressSchema = new mongoose.Schema({
  cep: { type: String, default: null },
  street: { type: String, default: null },
  number: { type: String, default: null },
  complement: { type: String, default: null },
  district: { type: String, default: null },
  city: { type: String, default: null },
  uf: { type: String, default: null }
}, { _id: false });

// Subdocumento Profile
const ProfileSchema = new mongoose.Schema({
  fullName: { type: String, default: null },
  email: { type: String, default: null },
  taxId: { type: String, default: null },
  birthDate: { type: Date, default: null },
  phone: { type: String, default: null },
  address: { type: AddressSchema, default: {} },
  kycStatus: { type: String, enum: ["pending","verified","rejected"], default: "pending" }
}, { _id: false });

// Schema principal ProfileBanking
const ProfileBankingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 👈 obrigatório
  profile: { type: ProfileSchema, default: {} },
  banking: { type: BankingSchema, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Atualiza updatedAt automaticamente
ProfileBankingSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

// Exporta o modelo
export const ProfileBanking = mongoose.models.ProfileBanking || mongoose.model("ProfileBanking", ProfileBankingSchema);
