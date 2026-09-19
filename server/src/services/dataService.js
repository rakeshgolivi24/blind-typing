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
  // --- USERS (MongoDB Atlas) ---
  async findUserBySuc(sucCode) {
    return await User.findOne({ sucCode: String(sucCode).trim() });
  },

  async findUserById(id) {
    return await User.findById(id);
  },

  async createUser({ sucCode, name, password }) {
    const user = new User({
      sucCode: String(sucCode).trim(),
      name: String(name).trim(),
      password,
      roundsCompleted: []
    });
    return await user.save();
  },

  async getAllUsers() {
    return await User.find({}).sort({ createdAt: -1 });
  },

  async addCompletedRound(userId, roundNumber) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { roundsCompleted: Number(roundNumber) } },
      { new: true }
    );
  },

  // --- SUBMISSIONS (MongoDB Atlas) ---
  async createSubmission(subData) {
    const sub = new Submission(subData);
    return await sub.save();
  },

  async getSubmission(sucCode, roundNumber) {
    return await Submission.findOne({
      sucCode: String(sucCode).trim(),
      roundNumber: Number(roundNumber)
    });
  },

  async getUserSubmissions(sucCode) {
    return await Submission.find({
      sucCode: String(sucCode).trim()
    }).sort({ roundNumber: 1 });
  },

  async getAllSubmissions() {
    return await Submission.find({}).sort({ completedAt: -1 });
  },

  // --- CONTEST CONFIG (MongoDB Atlas) ---
  async getConfig() {
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
  },

  async updateConfig(updates) {
    let cfg = await ContestConfig.findOne({});
    if (!cfg) {
      cfg = new ContestConfig({
        festName: 'BCAlgorix',
        leaderboardRevealed: false,
        roundTimeLimits: [120, 150, 180],
        roundPrompts: DEFAULT_PROMPTS,
        ...updates
      });
      return await cfg.save();
    }
    Object.assign(cfg, updates);
    return await cfg.save();
  }
};

module.exports = dataService;
