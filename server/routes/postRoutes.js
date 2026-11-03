import express from 'express';
import { query } from '../db/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { recordPostCreated } from '../services/metrics.js';
import { validatePostContent } from '../services/profanityService.js';

const router = express.Router();
const makeId = () => `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

function calculateReadingTime(text) {
  const words = (text || '').trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

/**
 * GET /api/posts/bookmarks/mine
 * Get all articles bookmarked by the authenticated user
 */
router.get('/bookmarks/mine', requireAuth, async (req, res) => {
  try {
    const bRes = await query('SELECT post_id FROM bookmarks WHERE user_id = $1', [req.user.id]);
    const bookmarkedIds = bRes.rows.map(r => r.post_id);
    res.json({ bookmarkedIds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bookmarks.', details: err.message });
  }
});

/**
 * GET /api/posts
 * Retrieve all posts with optional search, category, tag, or author filtering
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, tag, author } = req.query;
    
    // Fetch posts
    const result = await query('SELECT * FROM posts');
    let posts = result.rows;

    // Filter by category
    if (category && category !== 'all') {
      posts = posts.filter(p => 
        p.category_id === category || 
        (p.category_name && p.category_name.toLowerCase() === category.toLowerCase())
      );
    }

    // Filter by author
    if (author) {
      posts = posts.filter(p => p.user_id === author);
    }

    // Filter by tag
    if (tag) {
      posts = posts.filter(p => Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    // Search query matching title, subtitle, or content
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.author_username && p.author_username.toLowerCase().includes(q))
      );
    }

    res.json({ posts, count: posts.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch archive manuscripts.', details: err.message });
  }
});

/**
 * GET /api/posts/:id
 * Retrieve a single post with author and category details
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manuscript not found in the archives.' });
    }
    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load manuscript.', details: err.message });
  }
});

/**
 * POST /api/posts
 * Inscribe a new post (Auth required)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, subtitle, content, category_id, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required to inscribe a post.' });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters.' });
    }

    // Genuine Profanity Filter check on post creation
    const profanityCheck = validatePostContent({ title, subtitle, content });
    if (!profanityCheck.valid) {
      return res.status(400).json({ error: profanityCheck.error });
    }

    const postId = makeId();
    const readingTime = calculateReadingTime(content);
    const postTags = Array.isArray(tags) ? tags : [];
    const catId = category_id || 'cat-cathedral';

    const insertRes = await query(
      'INSERT INTO posts (id, user_id, category_id, title, subtitle, content, tags, reading_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [postId, req.user.id, catId, title.trim(), subtitle ? subtitle.trim() : '', content.trim(), postTags, readingTime]
    );

    const newPost = insertRes.rows[0] || {
      id: postId,
      user_id: req.user.id,
      category_id: catId,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      content: content.trim(),
      tags: postTags,
      reading_time: readingTime,
      likes_count: 0
    };

    recordPostCreated(catId);

    res.status(201).json({
      message: 'Manuscript inscribed into the archive.',
      post: newPost
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish manuscript.', details: err.message });
  }
});

/**
 * PUT /api/posts/:id
 * Edit an existing post (Enforces user ownership)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, subtitle, content, category_id, tags } = req.body;

    // Check if post exists
    const existing = await query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Manuscript not found.' });
    }

    const post = existing.rows[0];

    // Authorization check: User can only edit their own post
    if (post.user_id !== req.user.id && req.user.role !== 'archivist') {
      return res.status(403).json({ error: 'Forbidden. You may only edit manuscripts that you have authored.' });
    }

    // Genuine Profanity Filter check on post editing
    const profanityCheck = validatePostContent({ title, subtitle, content });
    if (!profanityCheck.valid) {
      return res.status(400).json({ error: profanityCheck.error });
    }

    const updatedTitle = title !== undefined ? title.trim() : post.title;
    const updatedSubtitle = subtitle !== undefined ? subtitle.trim() : post.subtitle;
    const updatedContent = content !== undefined ? content.trim() : post.content;
    const updatedCategory = category_id !== undefined ? category_id : post.category_id;
    const updatedTags = tags !== undefined ? tags : post.tags;

    const updateRes = await query(
      'UPDATE posts SET title = $1, subtitle = $2, content = $3, category_id = $4, tags = $5 WHERE id = $6 RETURNING *',
      [updatedTitle, updatedSubtitle, updatedContent, updatedCategory, updatedTags, postId]
    );

    res.json({
      message: 'Manuscript updated successfully.',
      post: updateRes.rows[0] || { ...post, title: updatedTitle, subtitle: updatedSubtitle, content: updatedContent }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update manuscript.', details: err.message });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete an existing post (Enforces user ownership)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if post exists
    const existing = await query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Manuscript not found.' });
    }

    const post = existing.rows[0];

    // Authorization check: User can only delete their own post
    if (post.user_id !== req.user.id && req.user.role !== 'archivist') {
      return res.status(403).json({ error: 'Forbidden. You may only delete manuscripts that you have authored.' });
    }

    await query('DELETE FROM posts WHERE id = $1', [postId]);

    res.json({
      message: 'Manuscript expunged from the archive.',
      id: postId
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete manuscript.', details: err.message });
  }
});

/**
 * POST /api/posts/:id/like
 * Toggle like for a post (Auth required)
 */
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Verify post exists
    const postCheck = await query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Manuscript not found.' });
    }

    // Check if like exists
    const check = await query('SELECT * FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    const isLiked = check.rows.length > 0;

    let liked = false;
    if (isLiked) {
      await query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
      liked = false;
    } else {
      await query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
      liked = true;
    }

    // Synchronize likes_count in posts table with actual likes count (never negative)
    await query(
      'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM likes WHERE post_id = $1) WHERE id = $1',
      [postId]
    );

    // Fetch updated like count
    const updatedPost = await query('SELECT likes_count FROM posts WHERE id = $1', [postId]);
    const likesCount = Number(updatedPost.rows[0]?.likes_count ?? 0);

    res.json({
      liked,
      likes_count: likesCount,
      message: liked ? 'Resonance bestowed.' : 'Resonance removed.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like.', details: err.message });
  }
});

/**
 * POST /api/posts/:id/bookmark
 * Toggle bookmark for a post (Auth required)
 */
router.post('/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const check = await query('SELECT * FROM bookmarks WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    const isBookmarked = check.rows.length > 0;

    if (isBookmarked) {
      await query('DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2', [userId, postId]);
      res.json({ bookmarked: false, message: 'Removed from personal archive.' });
    } else {
      await query('INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
      res.json({ bookmarked: true, message: 'Sealed into personal archive.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle bookmark.', details: err.message });
  }
});

export default router;
