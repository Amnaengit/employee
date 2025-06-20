/* eslint-disable no-console */
import path from "path";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import employeesRouter from "./routes/employees.js";

dotenv.config();
const __dirname = path.resolve();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
console.log("✅ MySQL pool created");

// Attach pool
app.use((req, _res, next) => {
  req.pool = pool;
  next();
});

// Serve public files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/employees", employeesRouter);

// Homepage
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
