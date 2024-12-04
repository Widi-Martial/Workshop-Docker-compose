import { pgClient } from './pgClient.js';
import fs from 'fs';

async function createTables() {
  // call method to read .sql file
  const querys = fs.readFileSync('./data/create_tables.sql').toString();
  await pgClient.query(querys);
}

// connect to bdd
await pgClient.connect();

console.log('===> Creating tables...');
await createTables();

await pgClient.end();
