import express from 'express';
import { query } from '../db/index.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const makeId = (name) => `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

/**
 * GET /api/categories
 * List all categories with associated article counts
 */
router.get('/', async (req, res) => {
  try {
    const categoriesRes = await query('SELECT * FROM categories ORDER BY name ASC');
    const postsRes = await query('SELECT category_id FROM posts');

    const counts = {};
    postsRes.rows.forEach(p => {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });

    const categoriesWithCount = categoriesRes.rows.map(cat => ({
      ...cat,
      postCount: counts[cat.id] || 0
    }));

    res.json({ categories: categoriesWithCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve categories.', details: err.message });
  }
});

/**
 * POST /api/categories
 * Dynamically create a new category (instantiates a new castle wing)
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, description, color, theme } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Category name must be at least 2 characters.' });
    }

    const trimmedName = name.trim();
    const id = makeId(trimmedName);

    // Check if category already exists
    const check = await query('SELECT id FROM categories WHERE id = $1 OR LOWER(name) = LOWER($2)', [id, trimmedName]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: 'A category with this name already exists in the castle registry.' });
    }

    const assignedColor = color || '#38BDF8';
    const assignedTheme = theme || 'arcane';
    const assignedDesc = description || `The ${trimmedName} wing of the imperial castle archive.`;

    const result = await query(
      'INSERT INTO categories (id, name, description, color, theme) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, trimmedName, assignedDesc, assignedColor, assignedTheme]
    );

    const newCat = result.rows[0] || {
      id,
      name: trimmedName,
      description: assignedDesc,
      color: assignedColor,
      theme: assignedTheme
    };

    res.status(201).json({
      message: 'New archive wing registered.',
      category: newCat
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.', details: err.message });
  }
});

export default router;
