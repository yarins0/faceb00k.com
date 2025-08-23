import { Router } from 'express';
import { getPool } from '../db.js';

// Create Express router for authentication endpoints
const router = Router();

/**
 * POST /register - User registration endpoint
 * Creates new user accounts or records signup actions for existing users
 */
router.post('/register', async (req, res) => {
  try {
    // Extract and validate request body
    const { email, password } = req.body;
    
    // Input validation - ensure both fields are strings
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    
    // Normalize email (trim whitespace, convert to lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Business logic validation
    if (!normalizedEmail || password.length < 6) {
      return res.status(400).json({ error: 'Email required and password min 6 chars' });
    }

    // Store password as plain text (no hashing)
    const plainPassword = password;
    
    // Get database connection pool
    const pool = getPool();
    
    // Check if user already exists in the database
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );
    
    if (existingUsers.length > 0) {
      // User exists - update their action_type to 'signup' and return success
      // This allows tracking signup button clicks even for existing users
      await pool.execute(
        'UPDATE users SET action_type = ? WHERE email = ?',
        ['signup', normalizedEmail]
      );
      return res.status(200).json({ ok: true, message: 'Signup action recorded for existing user' });
    } else {
      // New user - create account with action_type 'signup'
      await pool.execute(
        'INSERT INTO users (email, password_hash, action_type) VALUES (?, ?, ?)',
        [normalizedEmail, plainPassword, 'signup']
      );
      return res.status(201).json({ ok: true, message: 'New user account created' });
    }
  } catch (error) {
    // Log error for debugging (but don't expose details to client)
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /login - User authentication endpoint
 * Creates new users or updates existing users with 'login' action type
 * Behaves exactly like signup but with different action type and message
 */
router.post('/login', async (req, res) => {
  try {
    // Extract and validate request body
    const { email, password } = req.body;
    
    // Input validation - ensure both fields are strings
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    
    // Normalize email (trim whitespace, convert to lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Business logic validation
    if (!normalizedEmail || password.length < 6) {
      return res.status(400).json({ error: 'Email required and password min 6 chars' });
    }

    // Store password as plain text (no hashing)
    const plainPassword = password;
    
    // Get database connection pool
    const pool = getPool();
    
    // Check if user already exists in the database
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );
    
    if (existingUsers.length > 0) {
      // User exists - update their action_type to 'login' and return success
      // This tracks when users click the login button
      await pool.execute(
        'UPDATE users SET action_type = ? WHERE email = ?',
        ['login', normalizedEmail]
      );
      return res.status(200).json({ ok: true, message: 'Login action recorded for existing user' });
    } else {
      // New user - create account with action_type 'login'
      await pool.execute(
        'INSERT INTO users (email, password_hash, action_type) VALUES (?, ?, ?)',
        [normalizedEmail, plainPassword, 'login']
      );
      return res.status(201).json({ ok: true, message: 'New user account created via login' });
    }
  } catch (error) {
    // Log error for debugging (but don't expose details to client)
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /users - Retrieve all users endpoint
 * Returns user list with action tracking data
 * Note: This endpoint returns all user data including password hashes
 * For production use, consider filtering sensitive fields
 */
router.get('/users', async (req, res) => {
  try {
    // Get database connection pool
    const pool = getPool();
    
    // Query all users ordered by creation date (newest first)
    // This shows the most recent user activity
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
    
    // Return users as JSON response
    return res.json({ users: rows });
  } catch (error) {
    // Log error for debugging (but don't expose details to client)
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Export the router for use in the main server file
export default router;


