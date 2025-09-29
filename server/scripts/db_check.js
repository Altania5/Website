const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

(async () => {
  try {
    const mysql = require("mysql2/promise");
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true
    });

    const [tables] = await pool.query("SHOW TABLES");
    console.log("TABLES:", tables);

    try {
      const [desc] = await pool.query("DESCRIBE users");
      console.log("USERS COLUMNS:");
      for (const col of desc) {
        console.log(`- ${col.Field} (${col.Type})`);
      }
    } catch (e) {
      console.log("DESCRIBE users failed:", e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error("DB CHECK ERROR:", err.message);
    process.exit(1);
  }
})();


