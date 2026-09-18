const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Use reliable DNS servers for MongoDB Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

let isMongoConnected = false;
const dataDir = path.join(__dirname, '..', 'data');
const dataFilePath = path.join(dataDir, 'bcalgorix_store.json');

// Ensure data folder exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure local store file exists
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(
    dataFilePath,
    JSON.stringify(
      {
        users: [],
        submissions: [],
        config: {
          festName: 'BCAlgorix',
          leaderboardRevealed: false,
          roundTimeLimits: [120, 150, 180],
          roundPrompts: [
            {
              round: 1,
              title: "Round 1: Speed & Mechanics",
              description: "Warm-up phase. Visible typing with backspace allowed.",
              timeLimit: 120,
              text: "Algorithms are the invisible architects of the modern computing world. Every digital calculation, cryptographic handshake, and data structure relies on elegant logic crafted with precision and relentless focus. Speed is valuable, but flawless accuracy defines the true essence of engineering mastery."
            },
            {
              round: 2,
              title: "Round 2: Semi-Blind Precision",
              description: "Semi-blind phase. Typed characters appear as asterisks (*). Backspace allowed.",
              timeLimit: 150,
              text: "In computational problem solving, dynamic programming and recursive depth search unlock optimal pathways through complex state spaces. When typing under pressure, muscle memory bridges human thought and machine interpretation. Discipline and consistency turn challenging syntax into seamless execution, transforming abstract algorithms into tangible technological breakthroughs across distributed systems."
            },
            {
              round: 3,
              title: "Round 3: Extreme Blind Gauntlet",
              description: "Final phase. Asterisk masking (*), all backspaces blocked, zero correction.",
              timeLimit: 180,
              text: "True blind typing demands unyielding confidence in keyboard topography without visual reinforcement. In the arena of BCAlgorix, keystrokes resonate like binary pulses across silicon architectures. Without backspaces to retract hesitation or visual mirrors to verify letters, each tactile impulse must be deliberate and decisive. Champions achieve algorithmic harmony through composure, intuition, and uncompromised precision under the ticking contest clock."
            }
          ]
        }
      },
      null,
      2
    )
  );
}

function readLocalStore() {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local store:', err);
    return { users: [], submissions: [], config: {} };
  }
}

function writeLocalStore(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local store:', err);
  }
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bcalgorix';
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri.replace(/:([^:@]{4,})@/, ':****@')}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    isMongoConnected = true;
    console.log('[Database] MongoDB Atlas / Cloud successfully connected via Mongoose.');
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable at ${mongoUri} (${err.message}).`);
    console.log('[Database] Seamless local file persistence active at data/bcalgorix_store.json.');
    console.log('[Database] If you provide a working MongoDB URI in .env, MongoDB will be used automatically.');
  }
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  readLocalStore,
  writeLocalStore,
};
