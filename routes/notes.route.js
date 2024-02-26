const { Router } = require("express");
const postgres = require("@vercel/postgres");
const createTables = require("../tables/createTables");

const router = Router({ mergeParams: true });

router.get("/", async (request, response) => {
  createTables();
  // Select a single note from a specific user
  const { rows } = await postgres.sql`SELECT  todos.*, users.name
  FROM users
  LEFT JOIN todos ON todos."userId" = users.id 
  WHERE users.name = ${user} AND todos.id = ${id}`;
  // SELECT todos.* === todos.content, todos.id

  if (!rows.length) {
    return response.json({ error: "Note not found." });
  }
  return response.json(rows[0]);
});

/**
 * Create another route with method PUT
 * - specific route => "/users/:user/:id"
 * - update todo of the incoming id and user
 */

router.put("/", async (request, response) => {
  createTables();
  const user = request.params;
  const { content } = request.body;
  if (!content) {
    return response.json({ error: "Note NOT updated. Content is missing." });
  }
  // Checking if the users exist
  const {
    rows: [{ id }],
  } = await postgres.sql`SELECT id FROM users WHERE name = ${user}`;

  // Using the user's id to update the todo
  const { rowCount } =
    await postgres.sql`UPDATE todos SET content = ${content} FROM users WHERE todos.id = ${id} AND users.name = ${user}`;
  response.json({ message: "Successfully updated note." });

  if (!rowCount) {
    return response.json({ error: "Note not found." });
  }
});

/* Delete a specific todo from a specific user */
app.delete("/:id", async (request, response) => {
  createTables();
  /* const  tofu  = request.params.tofu; */
  const { id } = request.params;
  const { rowCount } = await postgres.sql`DELETE FROM todos WHERE id = ${id}`;

  if (!rowCount) {
    return response.json({ error: "Note not found." });
  }

  response.json({ message: "Successfully deleted note." });
});

module.exports = router;
