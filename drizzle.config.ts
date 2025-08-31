import 'dotenv/config';

import type { Config } from 'drizzle-kit';

const isProduction = process.env['NODE_ENV'] === 'production';

const TURSO_DATABASE_URL = process.env['TURSO_DATABASE_URL'];
if (!TURSO_DATABASE_URL) {
  throw new Error('Missing environment variable: TURSO_DATABASE_URL');
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: TURSO_DATABASE_URL,
    authToken: isProduction ? process.env['TURSO_AUTH_TOKEN'] : undefined,
  },
} satisfies Config;
