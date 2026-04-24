const express = require('express');
const { initDb } = require('./db');

const JWT_SECRET = 'homework_secret_key';
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

initDb();

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/users',  require('./routes/users'));
app.use('/api/events', require('./routes/events'));

app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = { JWT_SECRET };
