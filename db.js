const Database = require('better-sqlite3');

const db = new Database('events.db');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName       TEXT    NOT NULL,
      lastName        TEXT    NOT NULL,
      email           TEXT    NOT NULL UNIQUE,
      phone           TEXT    NOT NULL,
      password        TEXT    NOT NULL,
      profileImageUri TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      date        INTEGER NOT NULL,
      address     TEXT    NOT NULL,
      lat         REAL    NOT NULL,
      lon         REAL    NOT NULL,
      createdBy   INTEGER NOT NULL REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS event_participants (
      eventId INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      userId  INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
      PRIMARY KEY (eventId, userId)
    );
  `);
}

module.exports = { db, initDb };
