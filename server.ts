import 'dotenv/config';
import express from 'express';
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
  console.log('Starting server initialization...');
  const app = express();
  const PORT = 3000;

  // Database initialization
  let db: any;
  try {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'war_room.db');
    const dbDir = path.dirname(path.resolve(dbPath));
    console.log(`Initializing database at: ${dbPath}`);
    if (!fs.existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(dbPath);
    console.log('Database initialized successfully.');
    
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
  } catch (dbError) {
    console.error('CRITICAL: Database initialization failed:', dbError);
  }

  app.use(cors());
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

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
    if (!db) return res.status(503).json({ error: 'Database unavailable' });
    const { userId } = req.params;
    const rows = db.prepare('SELECT * FROM strategic_memory WHERE user_id = ?').all(userId);
    res.json(rows);
  });

  app.post('/api/memory', (req, res) => {
    if (!db) return res.status(503).json({ error: 'Database unavailable' });
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
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, the server.js is inside the dist folder
    // We want to serve the static files from the same folder
    const distPath = __dirname; 
    console.log(`Serving static files from: ${distPath}`);
    if (fs.existsSync(distPath)) {
      console.log(`Contents of dist: ${fs.readdirSync(distPath).join(', ')}`);
    } else {
      console.error(`CRITICAL: dist directory NOT FOUND at ${distPath}`);
    }
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`CRITICAL: index.html NOT FOUND at ${indexPath}`);
        res.status(404).send('Frontend build not found');
      }
    });
  }

  console.log(`Attempting to listen on 0.0.0.0:${PORT}...`);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });
}

startServer().catch(console.error);
