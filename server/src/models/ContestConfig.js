const mongoose = require('mongoose');

const contestConfigSchema = new mongoose.Schema({
  festName: {
    type: String,
    default: 'BCAlgorix'
  },
  leaderboardRevealed: {
    type: Boolean,
    default: false
  },
  roundTimeLimits: {
    type: [Number],
    default: [120, 150, 180]
  },
  roundPrompts: [
    {
      round: Number,
      title: String,
      description: String,
      timeLimit: Number,
      text: String
    }
  ]
});

module.exports = mongoose.model('ContestConfig', contestConfigSchema);
