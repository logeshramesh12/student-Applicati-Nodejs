const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const app = express();
app.use(express.json());
app.use(cors());

let db;

/* ------------------ AWS CONFIG ------------------ */
const REGION = process.env.AWS_REGION || "us-east-1";

const secretsClient = new SecretsManagerClient({
  region: REGION
});

/* ------------------ FETCH DB CONFIG FROM SECRETS MANAGER ------------------ */
async function getDBConfig() {
  const command = new GetSecretValueCommand({
    SecretId: "myapp/db/config" 
  });

  const response = await secretsClient.send(command);

  if (!response.SecretString) {
    throw new Error("Secret is empty");
  }

  const secret = JSON.parse(response.SecretString);

  if (!secret.host || !secret.user || !secret.password || !secret.database) {
    throw new Error("Missing DB config in secret");
  }

  return secret;
}

/* ------------------ CREATE DATABASE IF NOT EXISTS ------------------ */
async function ensureDatabaseExists(config) {
  const conn = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  await conn.end();

  console.log("✅ Database verified");
}

/* ------------------ CONNECT WITH RETRY ------------------ */
const connectWithRetry = async (retries = 10, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const cfg = await getDBConfig();

      await ensureDatabaseExists(cfg);

      const pool = await mysql.createPool({
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        database: cfg.database,
        connectionLimit: 10,
        ssl: { rejectUnauthorized: false }
      });

      console.log(`✅ Connected to MySQL (Attempt ${attempt})`);
      return pool;

    } catch (error) {
      console.error(`❌ MySQL connection failed (Attempt ${attempt}/${retries}):`, error.message);

      if (attempt === retries) throw error;

      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

/* ------------------ ENSURE TABLES ------------------ */
const ensureTables = async (db) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS student (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        roll_number VARCHAR(255),
        class VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        subject VARCHAR(255),
        class VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Tables ensured successfully");
  } catch (error) {
    console.error("❌ Error ensuring tables:", error);
    throw error;
  }
};

/* ------------------ START APP ------------------ */
(async () => {
  try {
    db = await connectWithRetry();
    // 🔥 TEST SECRET HERE (temporary)
    const config = await getDBConfig();
    console.log("🔐 DB CONFIG FROM SECRETS:", config);

    db = await connectWithRetry();
    await ensureTables(db);

    // ---- ROUTES ----
    app.get('/', async (req, res) => {
      const [data] = await db.query("SELECT * FROM student");
      res.json({ message: "Backend running 🚀", data });
    });

    app.get('/student', async (req, res) => {
      const [data] = await db.query("SELECT * FROM student");
      res.json(data);
    });

    app.get('/teacher', async (req, res) => {
      const [data] = await db.query("SELECT * FROM teacher");
      res.json(data);
    });

    app.post('/addstudent', async (req, res) => {
      const { name, rollNo, class: className } = req.body;

      await db.query(
        `INSERT INTO student (name, roll_number, class) VALUES (?, ?, ?)`,
        [name, rollNo, className]
      );

      res.json({ message: "Student added successfully" });
    });

    app.post('/addteacher', async (req, res) => {
      const { name, subject, class: className } = req.body;

      await db.query(
        `INSERT INTO teacher (name, subject, class) VALUES (?, ?, ?)`,
        [name, subject, className]
      );

      res.json({ message: "Teacher added successfully" });
    });

    app.delete('/student/:id', async (req, res) => {
      const { id } = req.params;

      const [result] = await db.query(
        "DELETE FROM student WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    });

    app.delete('/teacher/:id', async (req, res) => {
      const { id } = req.params;

      const [result] = await db.query(
        "DELETE FROM teacher WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      res.json({ message: "Teacher deleted successfully" });
    });

    app.listen(3500, () => {
      console.log("🚀 Server running on port 3500");
    });

  } catch (error) {
    console.error("❌ Fatal: Could not start server.", error);
    process.exit(1);
  }
})();