import 'dotenv/config';
import { pgClient } from './pgClient.js';
import fs from 'fs';

async function restoreDataBase() {
  const dumpFile = fs.readFileSync('../../data/dump.sql').toString();

  for (let query of dumpFile.split(';')) {
    query += ';';
    await pgClient.query(query);
  }
}

await pgClient.connect();

console.log('===> Restore Database...');
await restoreDataBase();
