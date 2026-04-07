import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

const router = Router();

// GET /api/cities
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM cities');
    res.json(rows);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
