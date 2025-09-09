// server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// --- In-memory data store for demo ---
let records = [];

// --- Health ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// --- Records (list) ---
app.get("/records", (req, res) => {
  const sorted = [...records].sort((a, b) => b.createdAt - a.createdAt);
  res.json(sorted);
});

// --- Records (create) ---
app.post("/records", (req, res) => {
  const { name, note } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  const rec = {
    id: String(Date.now()),
    name,
    note: note || "",
    createdAt: Date.now(),
  };
  records.push(rec);
  res.status(201).json(rec);
});

// --- Upload (multipart/form-data, field "file") ---
const upload = multer({ storage: multer.memoryStorage() });
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file is required" });
  res.json({
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// --- Fallbacks ---
app.get("/", (_req, res) => res.send("Mock API running"));
app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));

app.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
