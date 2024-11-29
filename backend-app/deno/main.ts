import { Hono } from "hono";
import { runOperationInIsolate } from "./runOperationInIsolate.ts";

const port = 3000;
const app = new Hono();

// Sample endpoint: Accept operation and payload
app.post("/api/:operation", async (c) => {
  const operation = c.req.param("operation");
  const payload = await c.req.json(); // Assuming JSON payload
  const result = await runOperationInIsolate(operation, payload);
  return c.json({ result: JSON.parse(result) });
});

app.get("/api/:operation", async (c) => {
  const operation = c.req.param("operation");
  const name = c.req.query('name');
  const result = await runOperationInIsolate(operation, { name });
  return c.json({ result: JSON.parse(result) });
});

// Start the server
Deno.serve({ port }, app.fetch);
