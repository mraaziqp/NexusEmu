import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database setup
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // API routes
  app.get("/api/health", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      res.json({ 
        status: "ok", 
        database: "connected", 
        timestamp: result.rows[0].now 
      });
    } catch (err) {
      console.error('Database connection error', err);
      res.status(500).json({ status: "error", database: "disconnected" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Server running on http://localhost:${PORT}`);
  });
}

startServer();
