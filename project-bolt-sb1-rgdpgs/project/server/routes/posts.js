import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database.js';
import { ContentModerator } from '../services/contentModerator.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    const { buffer } = req.file;

    // Optimize image
    const optimizedBuffer = await sharp(buffer)
      .resize(1080, 1080, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Moderate content
    const imageModeration = await ContentModerator.moderateImage(optimizedBuffer);
    const textModeration = ContentModerator.moderateText(caption);

    if (!imageModeration.isAppropriate || !textModeration.isAppropriate) {
      return res.status(400).json({ error: 'Content violates community guidelines' });
    }

    // Save post
    const postId = uuidv4();
    const imageUrl = `uploads/${postId}.jpg`;

    db.prepare(`
      INSERT INTO posts (id, userId, imageUrl, caption, isAdultContent)
      VALUES (?, ?, ?, ?, ?)
    `).run(postId, req.user.userId, imageUrl, caption, !imageModeration.isAppropriate);

    res.json({ id: postId, imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', (req, res) => {
  try {
    const user = db.prepare('SELECT isAdult FROM users WHERE id = ?').get(req.user.userId);
    
    let posts;
    if (user.isAdult) {
      posts = db.prepare(`
        SELECT p.*, u.username, u.fullName 
        FROM posts p
        JOIN users u ON p.userId = u.id
        ORDER BY p.createdAt DESC
      `).all();
    } else {
      posts = db.prepare(`
        SELECT p.*, u.username, u.fullName 
        FROM posts p
        JOIN users u ON p.userId = u.id
        WHERE p.isAdultContent = 0
        ORDER BY p.createdAt DESC
      `).all();
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as postsRouter };