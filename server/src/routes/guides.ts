import { Router, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const router = Router();

// POST /api/guides - create a guide
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { title, city_id, visibility, attractions } = req.body;
    const userId = req.user!.id;

    if (!title || !city_id) {
      res.status(400).json({ message: 'Title and city_id are required' });
      return;
    }

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO guides (user_id, title, city_id, visibility) VALUES (?, ?, ?, ?)',
      [userId, title, city_id, visibility || 'public']
    );

    const guideId = result.insertId;

    if (attractions && Array.isArray(attractions) && attractions.length > 0) {
      const values = attractions.map((a: { attraction_id: number; sort_order: number; comment?: string }) => [
        guideId,
        a.attraction_id,
        a.sort_order || 0,
        null,
        a.comment || null,
      ]);

      await connection.query(
        'INSERT INTO guide_attractions (guide_id, attraction_id, sort_order, photo_url, comment) VALUES ?',
        [values]
      );
    }

    await connection.commit();

    res.status(201).json({ message: 'Guide created successfully', id: guideId });
  } catch (error) {
    await connection.rollback();
    console.error('Create guide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// GET /api/guides/my - get current user's guides
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT g.*, c.name as city_name
       FROM guides g
       LEFT JOIN cities c ON g.city_id = c.id
       WHERE g.user_id = ?
       ORDER BY g.updated_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get my guides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/guides/public - get all public guides
router.get('/public', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT g.*, c.name as city_name, u.nickname as author
       FROM guides g
       LEFT JOIN cities c ON g.city_id = c.id
       LEFT JOIN users u ON g.user_id = u.id
       WHERE g.visibility = 'public'
       ORDER BY g.updated_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error('Get public guides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/guides/:id - get a specific guide with attractions
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [guides] = await pool.query<RowDataPacket[]>(
      `SELECT g.*, c.name as city_name, u.nickname as author
       FROM guides g
       LEFT JOIN cities c ON g.city_id = c.id
       LEFT JOIN users u ON g.user_id = u.id
       WHERE g.id = ?`,
      [id]
    );

    if (guides.length === 0) {
      res.status(404).json({ message: 'Guide not found' });
      return;
    }

    const [attractions] = await pool.query<RowDataPacket[]>(
      `SELECT ga.*, a.name, a.description, a.image_url, a.address
       FROM guide_attractions ga
       LEFT JOIN attractions a ON ga.attraction_id = a.id
       WHERE ga.guide_id = ?
       ORDER BY ga.sort_order ASC`,
      [id]
    );

    res.json({ ...guides[0], attractions });
  } catch (error) {
    console.error('Get guide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/guides/:id/pdf - generate PDF for a guide
router.get('/:id/pdf', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [guides] = await pool.query<RowDataPacket[]>(
      `SELECT g.*, c.name as city_name
       FROM guides g
       LEFT JOIN cities c ON g.city_id = c.id
       WHERE g.id = ?`,
      [id]
    );

    if (guides.length === 0) {
      res.status(404).json({ message: 'Guide not found' });
      return;
    }

    const guide = guides[0];

    const [attractions] = await pool.query<RowDataPacket[]>(
      `SELECT ga.*, a.name, a.description, a.image_url, a.address
       FROM guide_attractions ga
       LEFT JOIN attractions a ON ga.attraction_id = a.id
       WHERE ga.guide_id = ?
       ORDER BY ga.sort_order ASC`,
      [id]
    );

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Try to register a CJK font for Chinese character support
    const fontPaths = [
      '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
      '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
      '/usr/share/fonts/truetype/noto/NotoSansSC-Regular.otf',
      '/usr/share/fonts/opentype/noto/NotoSansSC-Regular.otf',
    ];

    let fontRegistered = false;
    for (const fontPath of fontPaths) {
      if (fs.existsSync(fontPath)) {
        doc.registerFont('CJK', fontPath);
        doc.font('CJK');
        fontRegistered = true;
        break;
      }
    }

    if (!fontRegistered) {
      doc.font('Helvetica');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=guide-${id}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(24).text(guide.title, { align: 'center' });
    doc.moveDown();

    // City name
    doc.fontSize(16).text(`City: ${guide.city_name || 'Unknown'}`, { align: 'center' });
    doc.moveDown(2);

    // Attractions
    for (let i = 0; i < attractions.length; i++) {
      const attraction = attractions[i];

      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }

      doc.fontSize(14).text(`${i + 1}. ${attraction.name || 'Unnamed Attraction'}`, {
        underline: true,
      });
      doc.moveDown(0.5);

      if (attraction.address) {
        doc.fontSize(10).text(`Address: ${attraction.address}`);
      }

      if (attraction.description) {
        doc.fontSize(10).text(`Description: ${attraction.description}`);
      }

      if (attraction.comment) {
        doc.fontSize(10).text(`Comment: ${attraction.comment}`);
      }

      // Include photo if available
      if (attraction.photo_url) {
        const photoPath = path.join(__dirname, '../../uploads', path.basename(attraction.photo_url));
        if (fs.existsSync(photoPath)) {
          try {
            doc.moveDown(0.5);
            doc.image(photoPath, { width: 200 });
          } catch {
            // Skip image if it can't be loaded
          }
        }
      }

      doc.moveDown(1.5);
    }

    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/guides/:id - update a guide
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, city_id, visibility, attractions } = req.body;

    // Check ownership
    const [guides] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM guides WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (guides.length === 0) {
      res.status(404).json({ message: 'Guide not found or not authorized' });
      return;
    }

    await connection.beginTransaction();

    await connection.query(
      'UPDATE guides SET title = ?, city_id = ?, visibility = ?, updated_at = NOW() WHERE id = ?',
      [title || guides[0].title, city_id || guides[0].city_id, visibility || guides[0].visibility, id]
    );

    if (attractions && Array.isArray(attractions)) {
      await connection.query('DELETE FROM guide_attractions WHERE guide_id = ?', [id]);

      if (attractions.length > 0) {
        const values = attractions.map((a: { attraction_id: number; sort_order: number; photo_url?: string; comment?: string }) => [
          id,
          a.attraction_id,
          a.sort_order || 0,
          a.photo_url || null,
          a.comment || null,
        ]);

        await connection.query(
          'INSERT INTO guide_attractions (guide_id, attraction_id, sort_order, photo_url, comment) VALUES ?',
          [values]
        );
      }
    }

    await connection.commit();

    res.json({ message: 'Guide updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update guide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// DELETE /api/guides/:id - delete a guide
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check ownership
    const [guides] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM guides WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (guides.length === 0) {
      res.status(404).json({ message: 'Guide not found or not authorized' });
      return;
    }

    await connection.beginTransaction();

    await connection.query('DELETE FROM guide_attractions WHERE guide_id = ?', [id]);
    await connection.query('DELETE FROM guides WHERE id = ?', [id]);

    await connection.commit();

    res.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete guide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

export default router;
