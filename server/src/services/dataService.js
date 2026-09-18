const { isMongoConnected, readLocalStore, writeLocalStore } = require('../db');
const User = require('../models/User');
const Submission = require('../models/Submission');
const ContestConfig = require('../models/ContestConfig');

// Default initial config prompts
const DEFAULT_PROMPTS = [
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
];

const dataService = {
  // --- USERS ---
  async findUserBySuc(sucCode) {
    if (isMongoConnected()) {
      return await User.findOne({ sucCode });
    }
    const store = readLocalStore();
    return store.users.find(u => u.sucCode === sucCode) || null;
  },

  async findUserById(id) {
    if (isMongoConnected()) {
      return await User.findById(id);
    }
    const store = readLocalStore();
    return store.users.find(u => u._id === id || u.id === id) || null;
  },

  async createUser({ sucCode, name, password }) {
    if (isMongoConnected()) {
      const user = new User({ sucCode, name, password, roundsCompleted: [] });
      return await user.save();
    }
    const store = readLocalStore();
    const newUser = {
      _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sucCode,
      name,
      password,
      roundsCompleted: [],
      createdAt: new Date().toISOString()
    };
    store.users.push(newUser);
    writeLocalStore(store);
    return newUser;
  },

  async getAllUsers() {
    if (isMongoConnected()) {
      return await User.find({}).sort({ createdAt: -1 });
    }
    const store = readLocalStore();
    return store.users || [];
  },

  async addCompletedRound(userId, roundNumber) {
    if (isMongoConnected()) {
      return await User.findByIdAndUpdate(
        userId,
        { $addToSet: { roundsCompleted: roundNumber } },
        { new: true }
      );
    }
    const store = readLocalStore();
    const user = store.users.find(u => u._id === userId || u.id === userId);
    if (user) {
      if (!user.roundsCompleted) user.roundsCompleted = [];
      if (!user.roundsCompleted.includes(roundNumber)) {
        user.roundsCompleted.push(roundNumber);
      }
      writeLocalStore(store);
    }
    return user;
  },

  // --- SUBMISSIONS ---
  async createSubmission(subData) {
    if (isMongoConnected()) {
      const sub = new Submission(subData);
      return await sub.save();
    }
    const store = readLocalStore();
    const newSub = {
      _id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...subData,
      completedAt: new Date().toISOString()
    };
    store.submissions.push(newSub);
    writeLocalStore(store);
    return newSub;
  },

  async getSubmission(sucCode, roundNumber) {
    if (isMongoConnected()) {
      return await Submission.findOne({ sucCode, roundNumber });
    }
    const store = readLocalStore();
    return store.submissions.find(s => s.sucCode === sucCode && s.roundNumber === Number(roundNumber)) || null;
  },

  async getUserSubmissions(sucCode) {
    if (isMongoConnected()) {
      return await Submission.find({ sucCode }).sort({ roundNumber: 1 });
    }
    const store = readLocalStore();
    return store.submissions.filter(s => s.sucCode === sucCode).sort((a, b) => a.roundNumber - b.roundNumber);
  },

  async getAllSubmissions() {
    if (isMongoConnected()) {
      return await Submission.find({}).sort({ completedAt: -1 });
    }
    const store = readLocalStore();
    return store.submissions || [];
  },

  // --- CONTEST CONFIG ---
  async getConfig() {
    if (isMongoConnected()) {
      let cfg = await ContestConfig.findOne({});
      if (!cfg) {
        cfg = new ContestConfig({
          festName: 'BCAlgorix',
          leaderboardRevealed: false,
          roundTimeLimits: [120, 150, 180],
          roundPrompts: DEFAULT_PROMPTS
        });
        await cfg.save();
      }
      return cfg;
    }
    const store = readLocalStore();
    if (!store.config) {
      store.config = {
        festName: 'BCAlgorix',
        leaderboardRevealed: false,
        roundTimeLimits: [120, 150, 180],
        roundPrompts: DEFAULT_PROMPTS
      };
      writeLocalStore(store);
    }
    return store.config;
  },

  async updateConfig(updates) {
    if (isMongoConnected()) {
      let cfg = await ContestConfig.findOne({});
      if (!cfg) {
        cfg = new ContestConfig({ ...updates });
      } else {
        Object.assign(cfg, updates);
      }
      return await cfg.save();
    }
    const store = readLocalStore();
    store.config = { ...(store.config || {}), ...updates };
    writeLocalStore(store);
    return store.config;
  }
};

module.exports = dataService;
