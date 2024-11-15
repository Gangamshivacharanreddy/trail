import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authRouter } from './routes/auth.js';
import { postsRouter } from './routes/posts.js';
import { commentsRouter } from './routes/comments.js';
import { setupDatabase } from './database.js';
import { authenticateToken } from './middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(express.json());

// Setup database
setupDatabase();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', authenticateToken, postsRouter);
app.use('/api/comments', authenticateToken, commentsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});