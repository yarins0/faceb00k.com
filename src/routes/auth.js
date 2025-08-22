import { Router } from 'express';
import bcrypt from 'bcrypt';
import { getPool } from '../db.js';

const router = Router();
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || '12');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 6) {
      return res.status(400).json({ error: 'Email required and password min 6 chars' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const pool = getPool();
    await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [normalizedEmail, passwordHash]
    );
    return res.status(201).json({ ok: true });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );
    const user = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;


