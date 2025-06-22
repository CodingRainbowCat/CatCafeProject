import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.RDS_HOSTNAME,
  port: Number(process.env.RDS_PORT || 5432),
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  ssl:  process.env.NODE_ENV !== 'development' ? {
    rejectUnauthorized: false,
  } : false
});
