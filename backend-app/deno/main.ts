import { prometheus } from '@hono/prometheus';
import { type Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { adminApp, admin_port } from './admin.ts';
import { getIsolateByName } from './db.ts';
import { runOperationInIsolate } from './runOperationInIsolate.ts';

const isolates_port = 3000;
const isolatesApp = new Hono();

const { printMetrics, registerMetrics } = prometheus({
  prefix: 'hono_app_',
  metricOptions: {
    requestDuration: {
      customLabels: {
        api_operation: (c: Context) => (c.req.routePath === '/metrics' ? 'metrics' : c.req.param('operation') ?? '')
      }
    },
    requestsTotal: {
      customLabels: {
        api_operation: (c: Context) => (c.req.routePath === '/metrics' ? 'metrics' : c.req.param('operation') ?? '')
      }
    }
  }
});

isolatesApp.use('/*', cors());
isolatesApp.use('*', registerMetrics);
isolatesApp.get('/metrics', printMetrics);

// Sample endpoint: Accept operation and payload
isolatesApp.post('/api/:operation', async c => {
  const operation = c.req.param('operation');
  const payload = await c.req.json(); // Assuming JSON payload
  // getIsolateByName(`${operation}.js`);
  const result = await runOperationInIsolate(operation, payload);
  return c.json({ result: JSON.parse(result) });
});

isolatesApp.get('/api/:operation', async c => {
  const operation = c.req.param('operation');
  const name = c.req.query('name');
  getIsolateByName(`${operation}.js`);
  const result = await runOperationInIsolate(operation, { name });
  return c.json({ result: JSON.parse(result) });
});

// Start the isolates server
Deno.serve({ port: isolates_port }, isolatesApp.fetch);

// Start the admin server
Deno.serve({ port: admin_port }, adminApp.fetch);
