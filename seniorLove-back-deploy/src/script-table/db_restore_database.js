import 'dotenv/config';
import { execSync } from 'child_process';

try {
  execSync(`psql ${process.env.DB_NAME} < ./data/dump.sql`, {
    encoding: 'utf-8',
  });
  console.log('Database successfully restored');
} catch (error) {
  console.error(error);
}
