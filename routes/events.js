const express = require('express');
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

// GET /api/events/creator/:userId  — must be before /:id
router.get('/creator/:userId', auth, (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE createdBy = ? ORDER BY id DESC').all(req.params.userId);
  res.json(events);
});

// GET /api/events
router.get('/', auth, (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY id DESC').all();
  res.json(events);
});

// POST /api/events
router.post('/', auth, (req, res) => {
  const { title, description, date, address, lat, lon, createdBy } = req.body;
  if (!title || !description || !date || !address || lat == null || lon == null || !createdBy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const result = db.prepare(
    'INSERT INTO events (title, description, date, address, lat, lon, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description, date, address, lat, lon, createdBy);
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

// GET /api/events/:id
router.get('/:id', auth, (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// PUT /api/events/:id
router.put('/:id', auth, (req, res) => {
  const { title, description, date, address, lat, lon, createdBy } = req.body;
  if (!title || !description || !date || !address || lat == null || lon == null || !createdBy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.prepare(
    'UPDATE events SET title = ?, description = ?, date = ?, address = ?, lat = ?, lon = ?, createdBy = ? WHERE id = ?'
  ).run(title, description, date, address, lat, lon, createdBy, req.params.id);
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// DELETE /api/events/:id
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ message: 'Event deleted' });
});

// GET /api/events/:eventId/participants
router.get('/:eventId/participants', auth, (req, res) => {
  const users = db.prepare(
    'SELECT u.* FROM users u JOIN event_participants ep ON ep.userId = u.id WHERE ep.eventId = ?'
  ).all(req.params.eventId);
  res.json(users.map(safeUser));
});

// POST /api/events/:eventId/participants
router.post('/:eventId/participants', auth, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const existing = db.prepare(
    'SELECT 1 FROM event_participants WHERE eventId = ? AND userId = ?'
  ).get(req.params.eventId, userId);
  if (existing) return res.status(409).json({ error: 'Already participating' });
  db.prepare('INSERT INTO event_participants (eventId, userId) VALUES (?, ?)').run(req.params.eventId, userId);
  res.status(201).json({ message: 'Joined event' });
});

// DELETE /api/events/:eventId/participants/:userId
router.delete('/:eventId/participants/:userId', auth, (req, res) => {
  db.prepare('DELETE FROM event_participants WHERE eventId = ? AND userId = ?').run(
    req.params.eventId, req.params.userId
  );
  res.json({ message: 'Participant removed' });
});

module.exports = router;
