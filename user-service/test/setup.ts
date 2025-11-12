import { config } from 'dotenv';
import { join } from 'path';

// Load .env.test if it exists, otherwise load .env
const envPath = join(__dirname, '..', '.env.test');
const fallbackPath = join(__dirname, '..', '.env');

try {
  config({ path: envPath });
  console.log('✅ Loaded .env.test');
} catch {
  config({ path: fallbackPath });
  console.log('✅ Loaded .env');
}