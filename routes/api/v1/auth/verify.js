const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const mainScriptDirectory = path.dirname(require.main.filename);
const dbPath = path.join(mainScriptDirectory, 'db', 'database.db');

const db = new sqlite3.Database(dbPath);

router.get('/:token', async (req, res) => {
  const verificationToken = req.params.token;

  try {
    db.get('SELECT id FROM users WHERE verification_token = ?', [verificationToken], async function (err, row) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Verification failed' });
      }

      if (!row) {
        return res.status(400).json({ success: false, message: 'Invalid verification token' });
      }

      const userId = row.id;

      db.run('UPDATE users SET verification_token = NULL WHERE id = ?', [userId], async function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, message: 'Verification failed' });
        }

        res.status(200).json({ success: true, message: 'Account verified successfully' });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;
