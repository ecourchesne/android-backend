const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

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

router.get('/:id', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(safeUser(user));
});

router.put('/:id/password', auth, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'Missing newPassword' });
  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.params.id);
  res.json({ message: 'Password updated' });
});

module.exports = router;
