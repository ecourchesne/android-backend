const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const router = express.Router();
const JWT_SECRET = 'homework_secret_key';

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function safeUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profileImageUri: user.profileImageUri ?? null,
  };
}

router.post('/register', (req, res) => {
  const { firstName, lastName, email, phone, password, profileImageUri } = req.body;
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (firstName, lastName, email, phone, password, profileImageUri) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(firstName, lastName, email, phone, hashed, profileImageUri ?? null);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ token: makeToken(user), user: safeUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: makeToken(user), user: safeUser(user) });
});

module.exports = router;
