import { Router } from 'express';
import Payment from '../models/Payment.js';
import Participant from '../models/Participant.js';
import { verifyWebhook } from '../middleware/verifyWebhook.js';

const router = Router();

/**
 * Webhook do PSP: espera um JSON como
 * { txid: string, status: 'CONCLUIDO' | 'EM_PROCESSAMENTO' | 'CANCELADO' | 'EXPIRADO' }
 */
router.post('/pix', verifyWebhook, async (req, res) => {
  try {
    const { txid, status } = req.body || {};
    if (!txid) return res.status(400).json({ message: 'txid ausente' });

    const payment = await Payment.findOne({ txid });
    if (!payment) return res.status(404).json({ message: 'Pagamento não encontrado' });

    let novoStatus = payment.status;
    if (status === 'CONCLUIDO') novoStatus = 'pago';
    else if (status === 'CANCELADO') novoStatus = 'falhado';
    else if (status === 'EXPIRADO') novoStatus = 'expirado';

    payment.status = novoStatus;
    if (novoStatus === 'pago') payment.paidAt = new Date();
    await payment.save();

    // também atualiza o participante
    const part = await Participant.findById(payment.participanteId);
    if (part) {
      part.statusPagamento = novoStatus;
      await part.save();
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Erro no webhook', error: err.message });
  }
});

export default router;