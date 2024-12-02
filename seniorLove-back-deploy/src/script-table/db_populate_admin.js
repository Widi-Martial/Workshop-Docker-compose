import 'dotenv/config';
import { pgClient } from './pgClient.js';
import { Scrypt } from '../src/auth/Scrypt.js';

async function populateAdmin() {

  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_MAIL;
  const adminPassword = Scrypt.hash(process.env.ADMIN_PASSWORD);
  const query = `INSERT INTO administrators (name, email, password)
          VALUES ($1,$2,$3) RETURNING *`;
  const result = await pgClient.query(query, [
    adminName,
    adminEmail,
    adminPassword,
  ]);
  console.log(result.rows);
}

await pgClient.connect();

console.log('===> Seeding admin...');
await populateAdmin();

await pgClient.end();