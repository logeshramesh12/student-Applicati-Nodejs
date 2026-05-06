// server.js

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const app = express();
app.use(express.json());
app.use(cors());

// Request logger (VERY useful in ECS)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

const SECRET = "mysecretkey";
let db;

/* ------------------ AWS CONFIG ------------------ */
const REGION = process.env.AWS_REGION || "us-east-1";

const secretsClient = new SecretsManagerClient({
  region: REGION
});

/* ------------------ FETCH DB CONFIG ------------------ */
async function getDBConfig() {
  try {
    console.log("🔐 Fetching DB config from Secrets Manager...");

    const command = new GetSecretValueCommand({
      SecretId: "myapp/db/config"
    });

    const response = await secretsClient.send(command);

    if (!response.SecretString) {
      throw new Error("Secret is empty");
    }

    console.log("✅ Secret fetched");

    return JSON.parse(response.SecretString);

  } catch (err) {
    console.error("❌ Failed to fetch secret:", err);
    throw err;
  }
}

/* ------------------ CONNECT DB ------------------ */
const connectDB = async () => {
  try {
    const cfg = await getDBConfig();

    console.log("🔌 Connecting to MySQL...");

    const pool = await mysql.createPool({
      host: cfg.host,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectionLimit: 10,
      ssl: { rejectUnauthorized: false }
    });

    // Test connection
    await pool.query("SELECT 1");

    console.log("✅ DB connected");

    return pool;

  } catch (err) {
    console.error("❌ DB connection failed:", err);
    throw err;
  }
};

/* ------------------ CREATE TABLES ------------------ */
const ensureTables = async (db) => {
  console.log("🧱 Creating tables if not exist...");

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Tables ready");
};

/* ------------------ AUTH ------------------ */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Teacher only" });
  }
  next();
};

/* ------------------ ROUTES ------------------ */

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Health check failed:", err);
    res.status(500).json({ status: "db_error" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'student')",
      [username, hashed]
    );
    res.json({ message: "Student registered" });
  } catch {
    res.status(400).json({ message: "Username exists" });
  }
});

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
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, role: user.role });
});

app.post("/addstudent", verifyToken, async (req, res) => {
  const { name, email, phone } = req.body;

  await db.query(
    "INSERT INTO students (name, email, phone) VALUES (?, ?, ?)",
    [name, email, phone]
  );

  res.json({ message: "Student added" });
});

app.get("/student", verifyToken, requireTeacher, async (req, res) => {
  const [data] = await db.query("SELECT * FROM students");
  res.json(data);
});

app.delete("/student/:id", verifyToken, requireTeacher, async (req, res) => {
  await db.query("DELETE FROM students WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

app.put("/student/:id", verifyToken, requireTeacher, async (req, res) => {
  const { name, email, phone } = req.body;

  await db.query(
    "UPDATE students SET name=?, email=?, phone=? WHERE id=?",
    [name, email, phone, req.params.id]
  );

  res.json({ message: "Updated" });
});

/* ------------------ START APP ------------------ */

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});

(async () => {
  try {
    console.log("🚀 Starting container...");

    db = await connectDB();
    await ensureTables(db);

    app.listen(3500, "0.0.0.0", () => {
      console.log("🚀 Server running on port 3500");
    });

  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();