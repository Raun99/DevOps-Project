import express from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/:id
 * Retrieve user public profile along with published articles
 */
router.get('/:id', async (req, res) => {
  try {
    const userRes = await query(
      'SELECT id, username, avatar, bio, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Scholar not found in the archives.' });
    }

    const user = userRes.rows[0];

    // Fetch user's articles
    const postsRes = await query(
      'SELECT id, title, subtitle, reading_time, likes_count, created_at, category_id FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({
      user,
      posts: postsRes.rows,
      postCount: postsRes.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve scholar record.', details: err.message });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const userId = req.user.id;

    // Check username collision if changed
    if (username) {
      const existing = await query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'This username is already claimed by another scholar.' });
      }
    }

    const updateRes = await query(
      'UPDATE users SET username = COALESCE($1, username), bio = COALESCE($2, bio), avatar = COALESCE($3, avatar) WHERE id = $4 RETURNING id, username, email, avatar, bio, role',
      [username || null, bio || null, avatar || null, userId]
    );

    const updatedUser = updateRes.rows[0];
    res.json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.', details: err.message });
  }
});

export default router;
