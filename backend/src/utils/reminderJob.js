const cron = require('node-cron');
const pool = require('../config/database');
const { sendWhatsAppMessage, buildReminderMessage } = require('../utils/whatsapp');

/**
 * Roda a cada hora: envia lembretes para agendamentos
 * que ocorrem em ~24 horas e ainda não receberam lembrete
 */
function startReminderJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 Verificando lembretes de agendamento...');
    try {
      const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const in23h = new Date(Date.now() + 23 * 60 * 60 * 1000);

      const result = await pool.query(
        `SELECT a.id, a.start_time,
                c.name as client_name, c.phone as client_phone,
                s.name as service_name,
                u.name as user_name, u.whatsapp_token, u.whatsapp_phone_id
         FROM appointments a
         JOIN clients c ON c.id = a.client_id
         JOIN services s ON s.id = a.service_id
         JOIN users u ON u.id = a.user_id
         WHERE a.start_time BETWEEN $1 AND $2
           AND a.status IN ('pending', 'confirmed')
           AND a.reminder_sent = false
           AND c.phone IS NOT NULL`,
        [in23h, in24h]
      );

      for (const appt of result.rows) {
        const message = buildReminderMessage({
          professionalName: appt.user_name,
          clientName: appt.client_name,
          serviceName: appt.service_name,
          startTime: appt.start_time,
        });

        const waResult = await sendWhatsAppMessage(appt.client_phone, message, {
          token: appt.whatsapp_token,
          phoneNumberId: appt.whatsapp_phone_id,
        });

        if (waResult.success) {
          await pool.query('UPDATE appointments SET reminder_sent = true WHERE id = $1', [appt.id]);
          console.log(`✅ Lembrete enviado: ${appt.client_name}`);
        }
      }
    } catch (err) {
      console.error('❌ Erro no job de lembretes:', err);
    }
  });

  console.log('⏰ Job de lembretes iniciado (a cada hora)');
}

module.exports = { startReminderJob };
