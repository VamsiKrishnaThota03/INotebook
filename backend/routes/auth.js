const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const { jwtSecret } = require('../config');

const router = express.Router();
const signToken = (user) => jwt.sign({ user: { id: user.id } }, jwtSecret, { expiresIn: '7d' });

// ROUTE 1: Create a user: POST /api/auth/createuser. No login required.
router.post(
  '/createuser',
  [
    body('name', 'Enter a valid name (at least 3 characters)').trim().isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Sorry, a user with this email already exists' });
      }
      const secPass = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({ name: req.body.name, password: secPass, email: req.body.email });
      return res.json({ success: true, authtoken: signToken(user) });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
);

// ROUTE 2: Authenticate a user: POST /api/auth/login. No login required.
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password cannot be blank').isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      const ok = user && (await bcrypt.compare(password, user.password));
      if (!ok) {
        return res.status(400).json({ success: false, error: 'Please try to login with correct credentials' });
      }
      return res.json({ success: true, authtoken: signToken(user) });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
);

// ROUTE 3: Get the logged-in user's details: POST /api/auth/getuser. Login required.
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
