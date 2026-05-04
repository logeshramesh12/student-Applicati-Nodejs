const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require("jsonwebtoken");

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "mysecretkey";
let db;

/* ------------------ AWS CONFIG ------------------ */
const REGION = process.env.AWS_REGION || "us-east-1";

const secretsClient = new SecretsManagerClient({
  region: REGION
});

/* ------------------ FETCH DB CONFIG ------------------ */
async function getDBConfig() {
  const command = new GetSecretValueCommand({
    SecretId: "myapp/db/config"
  });

  const response = await secretsClient.send(command);

  if (!response.SecretString) {
    throw new Error("Secret is empty");
  }

  return JSON.parse(response.SecretString);
}

/* ------------------ CONNECT DB ------------------ */
const connectDB = async () => {
  const cfg = await getDBConfig();

  const pool = await mysql.createPool({
    host: cfg.host,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }
  });

  console.log("✅ Connected to MySQL");
  return pool;
};

/* ------------------ CREATE TABLES ------------------ */
const ensureTables = async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      roll_number VARCHAR(255),
      class VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Tables ready");
};

/* ------------------ TOKEN MIDDLEWARE ------------------ */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ------------------ START APP ------------------ */
(async () => {
  try {
    db = await connectDB();
    await ensureTables(db);

    /* ================= ROUTES ================= */

    // ✅ LOGIN
    app.post("/login", async (req, res) => {
      const { username, password } = req.body;

      const [rows] = await db.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = rows[0];

      // TEMP plain password
      if (password !== user.password) {
        return res.status(401).json({ message: "Wrong password" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token, role: user.role });
    });

    // ✅ STUDENT ADD (only student)
   app.post("/addstudent", async (req, res) => {
  const { name, email, phone } = req.body;

  await db.query(
    `INSERT INTO students (name, email, phone) VALUES (?, ?, ?)`,
    [name, email, phone]
  );

  res.json({ message: "Student added successfully" });
});

    // ✅ TEACHER VIEW
    app.get("/student", verifyToken, async (req, res) => {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Access denied" });
      }

      const [data] = await db.query("SELECT * FROM students");
      res.json(data);
    });

    // ✅ TEACHER DELETE
    app.delete("/student/:id", verifyToken, async (req, res) => {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Access denied" });
      }

      await db.query("DELETE FROM students WHERE id = ?", [req.params.id]);

      res.json({ message: "Deleted successfully" });
    });

    // HEALTH
    app.get("/", (req, res) => {
      res.json({ message: "Backend running 🚀" });
    });

    app.listen(3500, () => {
      console.log("🚀 Server running on port 3500");
    });

  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
})();