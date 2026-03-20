require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Original Lab 06 routes
app.get("/", (req, res) => {
  res.send("Lab 06: Backend running and GitHub push successful");
});

app.get("/about", (req, res) => {
  res.send("Name: AMAAN KHAN | Enrollment: CS-23411442 | Section: 3CSE15");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    res.json({
      message: "PostgreSQL connected successfully!",
      time: result.rows[0].current_time,
    });
  } catch (err) {
    res.status(500).json({ error: "DB connection failed", details: err.message });
  }
});

// Classwork routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);