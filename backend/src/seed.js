require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

async function seed() {
  const email = "superadmin@lab.com";
  const password = await bcrypt.hash("superadmin123", 10);
  const name = "Super Admin";

  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'SUPER_ADMIN')
     ON CONFLICT (email) DO NOTHING`,
    [name, email, password]
  );
  console.log("SUPER_ADMIN seeded: superadmin@lab.com / superadmin123");
  process.exit();
}

seed();