import mysql from 'mysql2/promise';

// Database connection pool - shared across the application
// Uses singleton pattern to maintain one pool instance
let pool;

/**
 * Get or create the database connection pool
 * Uses singleton pattern to maintain one pool instance
 * @returns {Promise<Pool>} MySQL connection pool
 */
export function getPool() {
  if (!pool) {
    // Create new connection pool if one doesn't exist
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'fb_demo',
      waitForConnections: true,      // Wait for available connection
      connectionLimit: 10,           // Maximum connections in pool
      queueLimit: 0                  // No limit on connection queue
    });
  }
  return pool;
}

/**
 * Initialize database and create required tables
 * This function runs when the server starts to ensure the database is ready
 */
export async function ensureDatabaseSetup() {
  // Create a temporary root connection pool for database creation
  // Root privileges needed to create database
  const rootPool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 3,              // Smaller limit for root operations
    queueLimit: 0
  });

  // Get database name from environment or use default
  const database = process.env.MYSQL_DATABASE || 'fb_demo';
  
  // Create database if it doesn't exist
  // Uses utf8mb4 charset for full Unicode support (including emojis)
  await rootPool.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  
  // Close root connection pool - no longer needed
  await rootPool.end();

  // Get the main application connection pool
  const pool = getPool();
  
  // Create users table if it doesn't exist
  // This ensures the table structure is always up-to-date
  try {
          await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- Auto-incrementing unique ID
          email VARCHAR(255) NOT NULL UNIQUE,                   -- Unique email address
          password_hash VARCHAR(255) NOT NULL,                  -- Plain text password (no hashing)
          action_type ENUM('login', 'signup') NOT NULL DEFAULT 'signup',  -- Track user actions
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP        -- When user was created
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    
    // Migration: Add action_type column to existing tables if it doesn't exist
    // This handles cases where the table was created before this column was added
    try {
      await pool.query('ALTER TABLE users ADD COLUMN action_type ENUM("login", "signup") NOT NULL DEFAULT "signup"');
    } catch (error) {
      // Column already exists, ignore error
      // This is expected for new installations
      if (!error.message.includes('Duplicate column name')) {
        console.warn('Warning adding action_type column:', error.message);
      }
    }
  } catch (error) {
    console.error('Error setting up users table:', error);
    throw error;  // Re-throw to prevent server from starting with broken database
  }
}


