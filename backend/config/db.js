import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

let pool;

export async function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (connectionString) {
            pool = new Pool({
                connectionString,
                ssl: { rejectUnauthorized: false }
            });
        } else {
            pool = new Pool({
                host: process.env.PG_HOST || 'localhost',
                port: parseInt(process.env.PG_PORT || '5432'),
                database: process.env.PG_DATABASE || 'MedicalDB',
                user: process.env.PG_USER || 'postgres',
                password: process.env.PG_PASSWORD || '',
                max: 10,
                idleTimeoutMillis: 30000
            });
        }
    }
    return pool;
}

export async function testConnection() {
    try {
        const pool = await getPool();
        const result = await pool.query('SELECT 1 as test');
        console.log('✅ Database connection successful');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

testConnection();
