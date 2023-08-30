const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mainScriptDirectory = path.dirname(require.main.filename);
const dbPath = path.join(mainScriptDirectory, 'db', 'database.db');

const db = new sqlite3.Database(dbPath);

const jwtSecretKey = 'secret-key-lmao'; 

router.use(express.json());

router.post('/', async (req, res) => {
    const { identifier, password } = req.body;
  
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier],
      async (err, user) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, message: 'Login failed' });
        }
  
        if (!user) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
  
        if (user.verification_token !== null) {
          return res.status(401).json({ success: false, message: 'Please verify your email' });
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
  
        if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: 'Invalid password' });
        }
  
        const token = jwt.sign({ userId: user.id }, jwtSecretKey, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
  
        res.status(200).json({ success: true, message: 'Login successful', token});
      }
    );
  });
  
  module.exports = router;