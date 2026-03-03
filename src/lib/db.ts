import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_P6JQV3TOiAwY@ep-lingering-fog-a1hmafze.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default sql;

export interface DBUser {
  id: string;
}

export interface DBSleepEntry {
  id?: number;
  user_id: string;
  bedtime_hour: number;
  bedtime_minute: number;
  bedtime_am_pm: string;
  wake_hour: number;
  wake_minute: number;
  wake_am_pm: string;
  quality: number;
  date: string;
}

export async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS sleep_entries (
        id SERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id),
        bedtime_hour INTEGER NOT NULL,
        bedtime_minute INTEGER NOT NULL,
        bedtime_am_pm VARCHAR(2) NOT NULL,
        wake_hour INTEGER NOT NULL,
        wake_minute INTEGER NOT NULL,
        wake_am_pm VARCHAR(2) NOT NULL,
        quality INTEGER NOT NULL,
        date DATE NOT NULL,
        UNIQUE(user_id, date)
      );
    `;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
