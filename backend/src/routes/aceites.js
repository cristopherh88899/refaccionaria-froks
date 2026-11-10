import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Ruta para obtener todos los aceites
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM aceites');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para guardar un nuevo aceite
router.post('/', async (req, res) => {
  const { nombre, tipo, precio, stock, descripcion } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO aceites (nombre, tipo, precio, stock, descripcion) VALUES (?, ?, ?, ?, ?)',
      [nombre, tipo, precio, stock, descripcion]
    );
    res.json({ id: result.insertId, mensaje: 'Aceite registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;