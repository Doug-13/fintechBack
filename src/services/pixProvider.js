// back/src/services/pixProvider.js
import crypto from 'crypto';
import QRCode from 'qrcode';

function fakeTxid() {
  return crypto.randomBytes(16).toString('hex').slice(0, 26).toUpperCase();
}
function buildEMV({ amount, description, txid }) {
  // Apenas para testes (não é BR Code oficial)
  const valor = Number(amount).toFixed(2).replace('.', ',');
  return `000201BRPAYMOCK520400005303986540${valor}5802BR5912EVENTO DEMO6009SAO PAULO62190515${txid}6304ABCD`;
}

export const pixProvider = {
  async createCharge({ amount, description }) {
    const txid = fakeTxid();
    const emv = buildEMV({ amount, description, txid });
    const qrCodeDataUrl = await QRCode.toDataURL(emv); // data:image/png;base64,...
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10min
    return { txid, emv, qrCodeDataUrl, expiresAt };
  }
};
