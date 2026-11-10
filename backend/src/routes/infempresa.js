import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Obtener la información general de la refaccionaria
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM info_empresa LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;