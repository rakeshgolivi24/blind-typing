const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataService = require('../services/dataService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@bcalgorix2026';

const authController = {
  async register(req, res) {
    try {
      const { sucCode, name, password } = req.body;

      // Validate 10-digit SUC code
      if (!sucCode || !/^\d{10}$/.test(String(sucCode).trim())) {
        return res.status(400).json({ error: 'SUC Code must be exactly 10 numeric digits (e.g., 2452890430).' });
      }

      if (!name || String(name).trim().length < 2) {
        return res.status(400).json({ error: 'Please enter your full name (minimum 2 characters).' });
      }

      if (!password || String(password).length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
      }

      const cleanSuc = String(sucCode).trim();
      const existingUser = await dataService.findUserBySuc(cleanSuc);
      if (existingUser) {
        return res.status(409).json({ error: 'A candidate with this 10-digit SUC code is already registered. Please log in.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await dataService.createUser({
        sucCode: cleanSuc,
        name: String(name).trim(),
        password: hashedPassword
      });

      const token = jwt.sign(
        { id: newUser._id, sucCode: newUser.sucCode, name: newUser.name, role: 'candidate' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'Candidate registration successful',
        token,
        user: {
          id: newUser._id,
          sucCode: newUser.sucCode,
          name: newUser.name,
          roundsCompleted: newUser.roundsCompleted || []
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'Internal server error during registration.' });
    }
  },

  async login(req, res) {
    try {
      const { sucCode, password } = req.body;

      if (!sucCode || !/^\d{10}$/.test(String(sucCode).trim())) {
        return res.status(400).json({ error: 'Valid 10-digit SUC Code is required.' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Password is required.' });
      }

      const cleanSuc = String(sucCode).trim();
      const user = await dataService.findUserBySuc(cleanSuc);
      if (!user) {
        return res.status(401).json({ error: 'No candidate registered with this SUC code.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const token = jwt.sign(
        { id: user._id, sucCode: user.sucCode, name: user.name, role: 'candidate' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const submissions = await dataService.getUserSubmissions(cleanSuc);

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          sucCode: user.sucCode,
          name: user.name,
          roundsCompleted: user.roundsCompleted || [],
          submissions
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error during login.' });
    }
  },

  async adminLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Organizer username and password are required.' });
      }

      if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid organizer credentials.' });
      }

      const token = jwt.sign(
        { username: ADMIN_USERNAME, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Organizer admin authenticated',
        token,
        admin: {
          username: ADMIN_USERNAME,
          role: 'admin'
        }
      });
    } catch (err) {
      console.error('Admin login error:', err);
      return res.status(500).json({ error: 'Internal server error during admin login.' });
    }
  },

  async getMe(req, res) {
    try {
      const user = await dataService.findUserBySuc(req.user.sucCode);
      if (!user) {
        return res.status(404).json({ error: 'Candidate profile not found.' });
      }

      const submissions = await dataService.getUserSubmissions(user.sucCode);

      return res.json({
        user: {
          id: user._id,
          sucCode: user.sucCode,
          name: user.name,
          roundsCompleted: user.roundsCompleted || [],
          submissions
        }
      });
    } catch (err) {
      console.error('getMe error:', err);
      return res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
  }
};

module.exports = authController;
