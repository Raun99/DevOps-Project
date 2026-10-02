import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate IDs
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

/**
 * POST /api/auth/register
 * Register a new scholar
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio, avatar } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check existing email
    const existingEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: 'A scholar with this email already exists in the archive.' });
    }

    // Check existing username
    const existingName = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingName.rows.length > 0) {
      return res.status(409).json({ error: 'This username is already inscribed in the registry.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = makeId('usr');
    const userAvatar = avatar || username.substring(0, 2).toUpperCase();
    const userBio = bio || 'Scholar of the Imperial Observatory';

    const insertResult = await query(
      'INSERT INTO users (id, username, email, password_hash, avatar, bio, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, avatar, bio, role, created_at',
      [userId, username, email, passwordHash, userAvatar, userBio, 'scholar']
    );

    const user = insertResult.rows[0] || {
      id: userId,
      username,
      email,
      avatar: userAvatar,
      bio: userBio,
      role: 'scholar'
    };

    const token = generateToken(user);
    res.status(201).json({
      message: 'Scholar registered successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register scholar.', details: err.message });
  }
});

/**
 * POST /api/auth/login
 * Scholar sign-in
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. No record found in the archive.' });
    }

    const user = result.rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials. Password seal rejected.' });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role
    };

    const token = generateToken(safeUser);
    res.json({
      message: 'Access granted to Clandestine archives.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed.', details: err.message });
  }
});

/**
 * GET /api/auth/me
 * Retrieve currently logged-in user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT id, username, email, avatar, bio, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User record not found.' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile.', details: err.message });
  }
});

export default router;
