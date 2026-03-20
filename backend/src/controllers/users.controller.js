const bcrypt = require("bcryptjs");
const pool = require("../db");

exports.getMe = async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json(result.rows[0]);
};

exports.listUsers = async (req, res) => {
  let query = "SELECT id, name, email, role FROM users WHERE role != 'SUPER_ADMIN'";
  if (req.user.role === "ADMIN") query += " AND role = 'USER'";
  const result = await pool.query(query);
  res.json(result.rows);
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const allowedRoles = req.user.role === "SUPER_ADMIN" ? ["USER", "ADMIN"] : ["USER"];
  const targetRole = role || "USER";

  if (!allowedRoles.includes(targetRole))
    return res.status(403).json({ error: "Forbidden: cannot create this role" });

  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
      [name, email, hashed, targetRole]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(409).json({ error: "Email already exists" });
  }
};

exports.changeRole = async (req, res) => {
  const { role } = req.body;
  if (!["USER", "ADMIN", "SUPER_ADMIN"].includes(role))
    return res.status(400).json({ error: "Invalid role" });

  const result = await pool.query(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
    [role, req.params.id]
  );
  res.json(result.rows[0]);
};

exports.deleteUser = async (req, res) => {
  const target = await pool.query(
    "SELECT role FROM users WHERE id = $1",
    [req.params.id]
  );
  if (!target.rows[0])
    return res.status(404).json({ error: "User not found" });

  const targetRole = target.rows[0].role;
  if (req.user.role === "ADMIN" && targetRole !== "USER")
    return res.status(403).json({ error: "Forbidden" });

  await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
  res.json({ message: "User deleted" });
};