import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { nombre, compra, tipo, total, fecha } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO clientes (nombre, compra, tipo, total, fecha) VALUES (?, ?, ?, ?, ?)',
      [nombre, compra, tipo, total, fecha]
    );
    res.json({ id: result.insertId, mensaje: 'Cliente registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;