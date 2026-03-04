const express   = require("express");
const router    = express.Router();
const pool      = require("../config/database");
const webpush   = require("web-push");

webpush.setVapidDetails(
  "mailto:felipe.tech.brasil@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// GET /api/booking/:slug
router.get("/:slug", async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      "SELECT id, name, business_name, profession FROM users WHERE booking_slug = $1 AND onboarding_completed = true",
      [req.params.slug]
    );
    if (!user) return res.status(404).json({ error: "Profissional não encontrado" });

    const { rows: services } = await pool.query(
      "SELECT id, name, duration_minutes, price, color FROM services WHERE user_id = $1 AND active = true ORDER BY name",
      [user.id]
    );
    res.json({ professional: user, services });
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

// GET /api/booking/:slug/slots
router.get("/:slug/slots", async (req, res) => {
  const { date, service_id } = req.query;
  if (!date || !service_id) return res.status(400).json({ error: "date e service_id são obrigatórios" });

  try {
    const { rows: [user] } = await pool.query(
      "SELECT id FROM users WHERE booking_slug = $1", [req.params.slug]
    );
    if (!user) return res.status(404).json({ error: "Profissional não encontrado" });

    const dayOfWeek = new Date(date + "T12:00:00").getDay();
    const { rows: [wh] } = await pool.query(
      "SELECT * FROM working_hours WHERE user_id = $1 AND day_of_week = $2 AND is_open = true",
      [user.id, dayOfWeek]
    );
    if (!wh) return res.json({ slots: [] });

    const { rows: [service] } = await pool.query(
      "SELECT duration_minutes FROM services WHERE id = $1 AND user_id = $2 AND active = true",
      [service_id, user.id]
    );
    if (!service) return res.status(404).json({ error: "Serviço não encontrado" });

    const { rows: existing } = await pool.query(
      "SELECT start_time, end_time FROM appointments WHERE user_id = $1 AND DATE(start_time AT TIME ZONE 'America/Sao_Paulo') = $2 AND status NOT IN ('cancelled')",
      [user.id, date]
    );

    const slots = [];
    const [sh, sm] = wh.start_time.split(":").map(Number);
    const [eh, em] = wh.end_time.split(":").map(Number);
    const duration = service.duration_minutes;
    let cur = sh * 60 + sm;
    const endMin = eh * 60 + em;

    while (cur + duration <= endMin) {
      const slotStart  = String(Math.floor(cur / 60)).padStart(2, "0") + ":" + String(cur % 60).padStart(2, "0");
      const slotEndMin = cur + duration;
      const slotEnd    = String(Math.floor(slotEndMin / 60)).padStart(2, "0") + ":" + String(slotEndMin % 60).padStart(2, "0");

      let inLunch = false;
      if (wh.lunch_start && wh.lunch_end) {
        const [lh, lm]   = wh.lunch_start.split(":").map(Number);
        const [leh, lem] = wh.lunch_end.split(":").map(Number);
        const ls = lh * 60 + lm, le = leh * 60 + lem;
        if (cur < le && cur + duration > ls) inLunch = true;
      }

      const hasConflict = existing.some(a => {
        const as = new Date(a.start_time), ae = new Date(a.end_time);
        const ss = new Date(date + "T" + slotStart + ":00-03:00");
        const se = new Date(date + "T" + slotEnd   + ":00-03:00");
        return ss < ae && se > as;
      });

      if (!inLunch && !hasConflict) slots.push(slotStart);
      cur += 30;
    }
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST /api/booking/:slug — cria agendamento e dispara push
router.post("/:slug", async (req, res) => {
  const { service_id, start_time, client_name, client_phone } = req.body;
  if (!service_id || !start_time || !client_name || !client_phone)
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });

  try {
    const { rows: [user] } = await pool.query(
      "SELECT id, name, business_name FROM users WHERE booking_slug = $1",
      [req.params.slug]
    );
    if (!user) return res.status(404).json({ error: "Profissional não encontrado" });

    const { rows: [service] } = await pool.query(
      "SELECT * FROM services WHERE id = $1 AND user_id = $2 AND active = true",
      [service_id, user.id]
    );
    if (!service) return res.status(404).json({ error: "Serviço não encontrado" });

    const phone = client_phone.replace(/\D/g, "");
    let { rows: [client] } = await pool.query(
      "SELECT id FROM clients WHERE user_id = $1 AND phone = $2", [user.id, phone]
    );
    if (!client) {
      const { rows: [newClient] } = await pool.query(
        "INSERT INTO clients (user_id, name, phone) VALUES ($1,$2,$3) RETURNING id",
        [user.id, client_name, phone]
      );
      client = newClient;
    }

    const start = new Date(start_time + "-03:00");
    const end   = new Date(start.getTime() + service.duration_minutes * 60000);

    const { rows: conflicts } = await pool.query(
      "SELECT id FROM appointments WHERE user_id = $1 AND status NOT IN ('cancelled') AND (start_time < $2 AND end_time > $3)",
      [user.id, end.toISOString(), start.toISOString()]
    );
    if (conflicts.length > 0)
      return res.status(409).json({ error: "Horário não disponível. Escolha outro." });

    const { rows: [appointment] } = await pool.query(
      "INSERT INTO appointments (user_id, client_id, service_id, start_time, end_time, status, price_charged) VALUES ($1,$2,$3,$4,$5,'confirmed',$6) RETURNING *",
      [user.id, client.id, service_id, start.toISOString(), end.toISOString(), service.price]
    );

    // Responde imediatamente — push é disparado em background
    res.status(201).json({
      success: true,
      appointment: {
        id:                appointment.id,
        start_time:        appointment.start_time,
        service_name:      service.name,
        professional_name: user.name,
        business_name:     user.business_name,
        price:             service.price,
      }
    });

    // Dispara push para todos os dispositivos do profissional
    const horario = start.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

    const payload = JSON.stringify({
      title: "📅 Novo agendamento!",
      body:  `${client_name} — ${service.name} às ${horario}`,
      icon:  "/icon-192.png",
      badge: "/icon-192.png",
      data:  { url: "/app/appointments" },
    });

    const { rows: subs } = await pool.query(
      "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1",
      [user.id]
    );

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (pushErr) {
        // Remove subscription inválida/expirada
        if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
          await pool.query(
            "DELETE FROM push_subscriptions WHERE endpoint = $1", [sub.endpoint]
          );
        }
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;
