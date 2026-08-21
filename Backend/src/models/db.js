const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const setupDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ PostgreSQL Database tables initialized successfully.');
    } catch (error) {
        console.error('❌ Error initializing database tables:', error);
    } finally {
        client.release();
    }
};

module.exports = {
    pool,
    setupDatabase,
    query: (text, params) => pool.query(text, params)
};