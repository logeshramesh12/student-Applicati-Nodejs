const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const mysql = require("mysql2/promise");

async function test() {
  try {
    console.log("Connecting...");

    const conn = await mysql.createConnection({
      host: "database-student.c2do4o2qyd7u.us-east-1.rds.amazonaws.com",
      port: 3306,
      user: "admin12",
      password: "logeshram",
      database: "studentdb",
      connectTimeout: 60000
    });

    console.log("✅ CONNECTED");

    const [rows] = await conn.query("SHOW TABLES");

    console.log(rows);

    await conn.end();

  } catch (err) {
    console.error("❌ ERROR:");
    console.error(err);
  }
}

test();
