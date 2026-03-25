import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

export default pool;
