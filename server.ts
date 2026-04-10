import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import Database from 'better-sqlite3';
import multer from 'multer';
import fs from 'fs';
import { analyzeStrategy } from './src/services/gemini';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database initialization
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'war_room.db');
  const dbDir = path.dirname(path.resolve(dbPath));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const db = new Database(dbPath);

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS strategic_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      industry_key TEXT NOT NULL,
      last_win_prob REAL NOT NULL,
      last_factors TEXT NOT NULL,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, industry_key)
    )
  `);

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'PTC War Room Server is running' });
  });

  // AI Analysis Route
  app.post('/api/analyze', async (req, res) => {
    try {
      const { phase, input, lang, context } = req.body;
      const result = await analyzeStrategy(phase, input, lang, context);
      res.json(result);
    } catch (error) {
      console.error('AI Analysis error:', error);
      res.status(500).json({ error: 'Strategic Engine Offline' });
    }
  });

  // Memory Routes
  app.get('/api/memory/:userId', (req, res) => {
    const { userId } = req.params;
    const rows = db.prepare('SELECT * FROM strategic_memory WHERE user_id = ?').all(userId);
    res.json(rows);
  });

  app.post('/api/memory', (req, res) => {
    const { user_id, industry_key, last_win_prob, last_factors } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO strategic_memory (user_id, industry_key, last_win_prob, last_factors)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, industry_key) DO UPDATE SET
          last_win_prob = excluded.last_win_prob,
          last_factors = excluded.last_factors,
          update_time = CURRENT_TIMESTAMP
      `);
      stmt.run(user_id, industry_key, last_win_prob, JSON.stringify(last_factors));
      res.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to save memory' });
    }
  });

  // File Upload Setup
  const upload = multer({ dest: 'uploads/' });
  app.post('/api/upload', upload.single('file'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
      status: 'success',
      file_info: {
        filename: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
