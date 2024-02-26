const { Router } = require("express");
const postgres = require("@vercel/postgres");
const notes = require("./notes.js");
const createTables = require("../tables/createTables");

const router = Router({ mergeParams: true });

app.get("/", async (request, response) => {
  createTables();
  const { user } = request.params;
  const { rows } = await postgres.sql`SELECT *
      FROM users 
      RIGHT JOIN todos ON todos."userId" = users.id WHERE users.name = ${user}`;
  return response.json(rows);
});

// POST a user in to the table
router.post("/", async (request, response) => {
  createTables();
  const { name } = request.body;
  const { content } = request.body;

  if (!content) {
    return response.json({ error: "Todo NOT created. Content is missing." });
  }

  // Create a new user if it doesn't already exist
  await postgres.sql`INSERT INTO users (name) VALUES (${name}) ON CONFLICT DO NOTHING`;

  // Get the id of the new user
  const {
    rows: [{ id }],
  } = await postgres.sql`SELECT id FROM users WHERE name = ${name}`;

  // Create a new todo for the user
  await postgres.sql`INSERT INTO todos (content, "userId") VALUES (${content}, ${name})`;

  return response.json({
    message: "Successfully created user.",
    id,
  });
});

module.exports = router;
