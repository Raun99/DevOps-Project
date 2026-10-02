import express from 'express';
import { query } from '../db/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateCommentContent } from '../services/moderationService.js';
import { evaluateCanaryEligibility, formatCommentsPayload } from '../services/canaryService.js';

const router = express.Router();
const makeId = () => `comm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

/**
 * GET /api/comments/post/:postId
 * Retrieve comments for an article, passed through the Canary evaluation service
 */
router.get('/post/:postId', optionalAuth, async (req, res) => {
  try {
    const postId = req.params.postId;

    // Fetch raw comments for this post
    const result = await query(
      'SELECT c.*, u.username as author_username, u.avatar as author_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC',
      [postId]
    );

    // Evaluate Canary release status
    const canaryStatus = evaluateCanaryEligibility(req);

    // Format payload according to Canary channel (v1 flat vs v2 hierarchical tree)
    const payload = formatCommentsPayload(result.rows, canaryStatus.isCanary);

    res.json({
      ...payload,
      canary: {
        active: canaryStatus.isCanary,
        version: canaryStatus.version,
        reason: canaryStatus.reason
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve manuscript marginalia.', details: err.message });
  }
});

/**
 * POST /api/comments/post/:postId
 * Inscribe a new marginal note (comment) on an article (Auth required, Moderated)
 */
router.post('/post/:postId', requireAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content, parent_id } = req.body;

    // Verify post exists
    const postCheck = await query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Manuscript not found.' });
    }

    // Run Comment Moderation Service
    const moderation = validateCommentContent(content);
    if (!moderation.allowed) {
      return res.status(400).json({
        error: 'Comment rejected by archive moderation.',
        reason: moderation.reason
      });
    }

    // Verify parent comment if replying
    if (parent_id) {
      const parentCheck = await query('SELECT id FROM comments WHERE id = $1 AND post_id = $2', [parent_id, postId]);
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Parent comment not found on this manuscript.' });
      }
    }

    const commentId = makeId();
    const insertRes = await query(
      'INSERT INTO comments (id, post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [commentId, postId, req.user.id, moderation.sanitized, parent_id || null]
    );

    const newComment = {
      ...(insertRes.rows[0] || {
        id: commentId,
        post_id: postId,
        user_id: req.user.id,
        content: moderation.sanitized,
        parent_id: parent_id || null,
        created_at: new Date().toISOString()
      }),
      author_username: req.user.username,
      author_avatar: req.user.avatar || 'SC'
    };

    res.status(201).json({
      message: 'Marginal note inscribed into the codex.',
      comment: newComment
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to inscribe marginal note.', details: err.message });
  }
});

/**
 * DELETE /api/comments/:id
 * Expunge a comment (Enforces user ownership or archivist role)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const commentId = req.params.id;

    // Check if comment exists
    const check = await query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Marginal note not found.' });
    }

    const comment = check.rows[0];

    // Ownership authorization check
    if (comment.user_id !== req.user.id && req.user.role !== 'archivist') {
      return res.status(403).json({ error: 'Forbidden. You may only expunge marginal notes you have inscribed.' });
    }

    await query('DELETE FROM comments WHERE id = $1', [commentId]);

    res.json({
      message: 'Marginal note expunged from the codex.',
      id: commentId
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete marginal note.', details: err.message });
  }
});

export default router;
