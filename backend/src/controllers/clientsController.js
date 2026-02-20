const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE user_id = $1 ORDER BY name ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const create = async (req, res) => {
  const { name, phone, email, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clients (user_id, name, phone, email, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.userId, name, phone, email, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const update = async (req, res) => {
  const { name, phone, email, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clients SET name=$1, phone=$2, email=$3, notes=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [name, phone, email, notes, req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM clients WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name as service_name, s.price as service_price
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       WHERE a.client_id = $1 AND a.user_id = $2
       ORDER BY a.start_time DESC`,
      [req.params.id, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getAll, getOne, create, update, remove, getHistory };
