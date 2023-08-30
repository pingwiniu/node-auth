const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');

const mainScriptDirectory = path.dirname(require.main.filename);
const dbPath = path.join(mainScriptDirectory, 'db', 'database.db');

const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    verification_token TEXT
  )
`);

const transporterConfigPath = path.join(mainScriptDirectory, 'configuration', 'smtp.json');
let smtpConfig = { user: '', pass: '' };

try {
  const smtpConfigData = fs.readFileSync(transporterConfigPath, 'utf8');
  smtpConfig = JSON.parse(smtpConfigData);
} catch (error) {
  console.error('Error reading SMTP configuration:', error);
}


const transporter = nodemailer.createTransport({
  direct: true,
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.pass
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

router.use(express.json());

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || username.length < 3) {
    return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();

    db.run(
      'INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, verificationToken],
      async function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, message: 'Registration failed' });
        }

        const mailOptions = {
          from: 'noreply@exampledomain.com',
          to: email,
          subject: 'Email Verification',
          html: `<!DOCTYPE html>
          <html>
          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                  }
                  .container {
                      text-align: center;
                      margin-top: 50px;
                  }
                  .button {
                      display: inline-block;
                      background-color: #007bff;
                      color: white;
                      padding: 10px 20px;
                      border-radius: 5px;
                      text-decoration: none;
                  }
                  .disclaimer {
                      margin-top: 20px;
                      font-size: 12px;
                      color: #777;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h2>Email Verification</h2>
                  <p>Hello ${username},</p>
                  <p>Thank you for signing up with myapp! To complete your registration, please click the button below to verify your email address:</p>
                  <a class="button" href="http://localhost:3000/api/v1/auth/verify/${verificationToken}">
                      Verify Email
                  </a>
                  <p>If the button above doesn't work, you can also copy and paste the following link into your browser's address bar:</p>
                  <p>http://localhost:3000/api/v1/auth/verify/${verificationToken}</p>
                  <p class="disclaimer">If you didn't sign up for an account on our platform, you can safely ignore this email.</p>
                  <p class="disclaimer">If you have any questions or concerns, please contact our support team at [support@exampledomain.com].</p>
                  <p>Thank you!</p>
                  <p>The myapp Team</p>
              </div>
          </body>
          </html>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (error) {
          console.error(error);
        }

        res.status(201).json({ success: true, message: 'Registration successful, check your email', userId: this.lastID });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

module.exports = router;
