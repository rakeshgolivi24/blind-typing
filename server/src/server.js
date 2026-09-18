require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, isMongoConnected } = require('./db');

const authRoutes = require('./routes/authRoutes');
const contestRoutes = require('./routes/contestRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const path = require('path');
const fs = require('fs');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contest', contestRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    fest: 'BCAlgorix',
    event: 'Blind Typing Contest',
    database: isMongoConnected() ? 'MongoDB' : 'Resilient File Store',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if available
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Fallback 404 for API
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Initialize DB and launch server
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  BCAlgorix Blind Typing Contest Server Ready`);
    console.log(`  Port: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

start();
