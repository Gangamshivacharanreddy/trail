import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, dateOfBirth } = req.body;

    // Check if email or phone already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR phoneNumber = ?')
      .get(email, phoneNumber);

    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Calculate age
    const age = Math.floor(
      (Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, password, fullName, phoneNumber, dateOfBirth, isAdult)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, hashedPassword, fullName, phoneNumber, dateOfBirth, age >= 18);

    // Generate token
    const token = jwt.sign({ userId, email }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as authRouter };