import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createIsolatesTable, insertIsolate } from './db.ts';

const admin_port = 5000;
const adminApp = new Hono();

adminApp.use('/*', cors());

createIsolatesTable();

adminApp.get('/', c => {
  return c.json({ greet: 'hello world' });
});

adminApp.post('/upload-isolate', async c => {
  try {
    // Parse JSON payload
    const { fileName, fileContent } = await c.req.json();
    console.log(fileName, fileContent);

    if (!fileName || !fileContent) {
      return c.json({ error: 'File name and content are required' }, 400);
    }

    // Insert file data into the SQLite database
    insertIsolate(fileName, fileContent);
    return c.json({ message: 'File saved successfully' }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to save file' }, 500);
  }
});

export { admin_port, adminApp };
