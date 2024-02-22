const express = require("express");
const postgres = require("@vercel/postgres");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", async (request, response) => {
  createTables();
  //table was created => load data
  const { rows } = await postgres.sql`SELECT * FROM todos`;
  return response.json(rows);
});

app.get("/:id", async (request, response) => {
  createTables();
  //table was created => load data
  const { id } = request.params;
  const { rows } = await postgres.sql`SELECT * FROM todos WHERE id = ${id}`;

  if (!rows.length) {
    return response.json({ error: "Note not found." });
  }

  return response.json(rows[0]);
});

app.post("/", async (request, response) => {
  createTables();
  const { content } = JSON.parse(request.body);
  if (content) {
    await postgres.sql`INSERT INTO todos (content) VALUES (${content})`;
    response.json({ message: "Successfully created note." });
  } else {
    response.json({ error: "Note NOT created. Content is missing." });
  }
});

/* vegan delete route */
app.delete("/:tofu", async (request, response) => {
  createTables();
  /* const  tofu  = request.params.tofu; */
  const { tofu } = request.params;
  const { rowCount } = await postgres.sql`DELETE FROM todos WHERE id = ${tofu}`;

  if (!rowCount) {
    return response.json({ error: "Note not found." });
  }

  response.json({ message: "Successfully deleted note." });
});

// update table
app.put("/:id", async (request, response) => {
  createTables();
  //table was created => load data
  const { id } = request.params;
  const { content } = JSON.parse(request.body);

  if (!content) {
    return response.json({ error: "Note NOT updated. Content is missing." });
  }
  await postgres.sql`UPDATE todos SET content = ${content} WHERE id = ${id}`;
  response.json({ message: "Successfully updated note." });
});

app.get("/users/:user", async (request, response) => {
  createTables();
  const { user } = request.params;
  const { rows } = await postgres.sql`SELECT *
    FROM users 
    RIGHT JOIN todos ON todos."userId" = users.id WHERE users.name = ${user}`;
  return response.json(rows);
});

// select todos of a specific user
app.get("/users/:user/:id", async (request, response) => {
  createTables();
  const { user, id } = request.params;

  const { rows } = await postgres.sql`SELECT  todos.*, users.name
    FROM users
    LEFT JOIN todos ON todos."userId" = users.id 
    WHERE users.name = ${user} AND todos.id = ${id}`;
  // SELECT todos.* === todos.content, todos.id
  return response.json(rows);
});

/**
 * Create another route with method PUT
 * - specific route => "/users/:user/:id"
 * - update todo of the incoming id and user
 */

app.put("/users/:user/:id", async (request, response) => {
  createTables();
  const { user, id } = request.params;
  const { content } = JSON.parse(request.body);
  if (!content) {
    return response.json({ error: "Note NOT updated. Content is missing." });
  }
  await postgres.sql`UPDATE todos SET content = ${content} WHERE id = ${id} AND "userId" = ${user}`;
  response.json({ message: "Successfully updated note." });
});

// default catch-all handler
app.get("*", (request, response) => {
  response.status(404).json({ message: "route not defined" });
});

module.exports = app;

/*
 * - we want to create a new table called notes
 * - from within our code
 */
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
