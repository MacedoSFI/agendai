const axios = require('axios');

/**
 * Envia mensagem via WhatsApp Cloud API
 * @param {string} clienteTelefone - Número no formato internacional ex: 5511999999999
 * @param {string} mensagem - Texto da mensagem
 * @param {object} options - { token, phoneNumberId } - credenciais do usuário (opcional, usa .env como fallback)
 */
async function sendWhatsAppMessage(clienteTelefone, mensagem, options = {}) {
  const token = options.token || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = options.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('⚠️  WhatsApp não configurado. Configure WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID');
    return { success: false, reason: 'not_configured' };
  }

  // Limpa o número: mantém apenas dígitos
  const phone = clienteTelefone.replace(/\D/g, '');

  try {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: mensagem },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ WhatsApp enviado para ${phone}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Monta mensagem de confirmação de agendamento
 */
function buildConfirmationMessage({ professionalName, clientName, serviceName, startTime, price }) {
  const date = new Date(startTime);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return `Olá ${clientName}! 👋

Seu agendamento foi confirmado com *${professionalName}*:

📋 *Serviço:* ${serviceName}
📅 *Data:* ${formattedDate}
🕐 *Horário:* ${formattedTime}
💰 *Valor:* R$ ${parseFloat(price).toFixed(2)}

Em caso de dúvidas ou necessidade de cancelamento, entre em contato diretamente.

_Agendado via AgendAI_ ✨`;
}

/**
 * Monta mensagem de lembrete
 */
function buildReminderMessage({ professionalName, clientName, serviceName, startTime }) {
  const date = new Date(startTime);
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return `Olá ${clientName}! ⏰

Este é um lembrete do seu agendamento com *${professionalName}*:

📋 *Serviço:* ${serviceName}
🕐 *Horário:* ${formattedTime} *(hoje!)*

Não se esqueça! Te aguardamos. 😊

_AgendAI_ ✨`;
}

module.exports = { sendWhatsAppMessage, buildConfirmationMessage, buildReminderMessage };
