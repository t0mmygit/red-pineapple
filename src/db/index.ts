import 'dotenv/config';

import { drizzle } from 'drizzle-orm/libsql';
import { Config, createClient } from '@libsql/client';
import { events, submissions, users } from './schema.js';

const isProduction = process.env['NODE_ENV'] === 'production';

let clientOptions: Config;

const TURSO_DATABASE_URL = process.env['TURSO_DATABASE_URL'];
if (!TURSO_DATABASE_URL) {
  throw new Error('Missing environment variable: TURSO_DATABASE_URL');
}

if (isProduction) {
  const TURSO_AUTH_TOKEN = process.env['TURSO_AUTH_TOKEN'];

  if (!TURSO_AUTH_TOKEN) {
    throw new Error('Missing environment variable: TURSO_AUTH_TOKEN');
  }

  clientOptions = { url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN };
} else {
  clientOptions = { url: TURSO_DATABASE_URL };
}

const turso = createClient(clientOptions);

export const db = drizzle(
  turso,
  {
    casing: 'snake_case',
    schema: {
      users,
      events,
      submissions,
    },
  }
);
