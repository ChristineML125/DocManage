//read environment variables from .env file
import dotenv from 'dotenv';
// import mssql from 'mssql', connect to SQL Server database using mssql package;
import sql from 'mssql';

dotenv.config();

const config = {
    // SQL Server connection configuration, using environment variables with defaults
    server: process.env.SQL_SERVER,
    port: parseInt(process.env.SQL_PORT),
    // Database name, defaulting to 'MedicalDB' if not set in environment variables
    database: process.env.SQL_DATABASE,
    // login SQL Server using environment variables for user and password
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    // options for controlling SQL Server connection behavior, such as encryption and certificate trust
    options: {
        encrypt: process.env.SQL_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQL_TRUST_CERT !== 'false'
    },
    //connection pool setting to manage database with a maximum of 10 connections, minimum of 0, and idle timeout of 30 seconds
    //important beacuase SQL server connections are expensive, so we want to reuse them instead of creating new ones for every request
    pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
//poolPromise variable to hold the connection pool promise, ensuring that we only create one pool and reuse it across the application
let poolPromise;

// this function returns the connenction poolPromise.
// This way, we can reuse the same connection pool across the application, improving performance and resource management.
export async function getPool() {
    // if it doesn't exist, it creates a new connection pool using the config object and assigns it to poolPromise.
    if (!poolPromise) {
        poolPromise = sql.connect(config);
    }
    return poolPromise;
}

console.log("SQL CONFIG:", config);

export async function testConnection() {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT 1 as test');
        console.log('✅ Database connection successful');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Error details:', err);
        return false;
    }
}

testConnection();

//exporting the sql object from mssql package, allowing other parts of the application to use it for executing queries and managing database interactions.
export { sql };