import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(process.env.DATABASE_PATH || "experiment.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario TEXT,
    order_type TEXT,
    mode_a_data TEXT,
    mode_b_data TEXT,
    comparison_data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/submit", (req, res) => {
    try {
      const { scenario, orderType, modeA, modeB, comparison } = req.body;
      const stmt = db.prepare(`
        INSERT INTO results (scenario, order_type, mode_a_data, mode_b_data, comparison_data)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(scenario, orderType, JSON.stringify(modeA), JSON.stringify(modeB), JSON.stringify(comparison));
      res.json({ success: true });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.get("/api/stats", (req, res) => {
    const count = db.prepare("SELECT COUNT(*) as total FROM results").get() as { total: number };
    res.json(count);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
