import { DB } from 'deno-sqlite';
const dbFile = './isolates.db';

const db = new DB(dbFile);

export const createIsolatesTable = () => {
  // Create a table to store files
  db.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        content TEXT NOT NULL
      );
    `);
};

export const insertIsolate = (name: string, content: string) => {
  db.query(`INSERT INTO files (name, content) VALUES (:name, :content)`, { name, content });
};

export const getIsolateByName = (name: string): string => {
  const [content] = db.query('SELECT content FROM files WHERE name = :name', { name });
  return (content[0] as string) || '';
};
