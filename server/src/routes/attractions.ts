import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

const router = Router();

// GET /api/attractions?city_id=X
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { city_id } = req.query;

    if (!city_id) {
      res.status(400).json({ message: 'city_id query parameter is required' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM attractions WHERE city_id = ?',
      [city_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get attractions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
