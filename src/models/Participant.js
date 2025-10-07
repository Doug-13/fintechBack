import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    eventoId: { type: mongoose.Types.ObjectId, ref: 'Event', required: true, index: true },
    nome: { type: String, required: true },
    email: { type: String, required: true },
    statusPagamento: { type: String, enum: ['pendente', 'pago', 'falhado', 'expirado'], default: 'pendente' }
  },
  { timestamps: true }
);

export default mongoose.model('Participant', participantSchema);