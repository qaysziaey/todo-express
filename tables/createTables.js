const postgres = require("@vercel/postgres");

async function createTables() {
  await postgres.sql`CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE
      )`;

  await postgres.sql`CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        content VARCHAR(255),
        "userId" INTEGER REFERENCES users(id)  
    )`;
}

module.exports = createTables;
