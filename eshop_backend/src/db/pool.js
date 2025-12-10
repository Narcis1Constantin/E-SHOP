require('dotenv').config();
const { Pool } = require('pg');

console.log("ENV DATABASE_URL =", process.env.DATABASE_URL);

const isNeon = process.env.DATABASE_URL?.includes('neon.tech');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isNeon
        ? { rejectUnauthorized: false }  // pentru Neon
        : false                          // pentru PostgreSQL local
});

// test conexiune
pool.connect()
    .then(client => {
        console.log('Connected to database');
        client.release();
    })
    .catch(err => {
        console.error('DB ERROR:', err);
    });

module.exports = pool;
