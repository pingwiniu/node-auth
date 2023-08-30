const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const mainScriptDirectory = path.dirname(require.main.filename);
const dbPath = path.join(mainScriptDirectory, 'db', 'database.db');

const db = new sqlite3.Database(dbPath);
const jwtSecretKey = 'secret-key-lmao';

router.use(express.json());

router.post('/', (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const tokenWithoutBearer = token.replace('Bearer ', '');

  jwt.verify(tokenWithoutBearer, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = decoded.userId;

    db.get('SELECT id, username, email FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Error fetching user info' });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, user });
    });
  });
});

module.exports = router;
