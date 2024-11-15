import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database.js';
import { ContentModerator } from '../services/contentModerator.js';

const router = express.Router();

router.post('/:postId', async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    // Moderate comment content
    const moderation = ContentModerator.moderateText(content);
    if (!moderation.isAppropriate) {
      return res.status(400).json({ 
        error: 'Comment contains inappropriate content or excessive negativity' 
      });
    }

    const commentId = uuidv4();
    db.prepare(`
      INSERT INTO comments (id, postId, userId, content)
      VALUES (?, ?, ?, ?)
    `).run(commentId, postId, req.user.userId, content);

    res.json({ id: commentId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:postId', (req, res) => {
  try {
    const { postId } = req.params;
    const comments = db.prepare(`
      SELECT c.*, u.username, u.fullName 
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC
    `).all(postId);

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as commentsRouter };