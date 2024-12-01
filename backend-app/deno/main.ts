import { Context, Hono } from "hono";
import { runOperationInIsolate } from "./runOperationInIsolate.ts";
import { prometheus } from "@hono/prometheus";

const port = 3000;
const app = new Hono();
const { printMetrics, registerMetrics } = prometheus({
  prefix: "hono_app_",
  metricOptions: {
    requestDuration: {
      customLabels: {
        api_operation: (c: Context) => c.req.routePath === '/metrics' ? 'metrics' : c.req.param("operation") ?? ''
      }
    },
    requestsTotal: {
      customLabels: {
        api_operation: (c: Context) => c.req.routePath === '/metrics' ? 'metrics' : c.req.param("operation") ?? ''
      }
    },
  },
});

app.use("*", registerMetrics);
app.get("/metrics", printMetrics);

// Sample endpoint: Accept operation and payload
app.post("/api/:operation", async (c) => {
  const operation = c.req.param("operation");
  const payload = await c.req.json(); // Assuming JSON payload
  const result = await runOperationInIsolate(operation, payload);
  return c.json({ result: JSON.parse(result) });
});

app.get("/api/:operation", async (c) => {
  const operation = c.req.param("operation");
  const name = c.req.query("name");
  const result = await runOperationInIsolate(operation, { name });
  return c.json({ result: JSON.parse(result) });
});

// Start the server
Deno.serve({ port }, app.fetch);
