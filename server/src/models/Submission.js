const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sucCode: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  roundNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  originalText: {
    type: String,
    required: true
  },
  typedText: {
    type: String,
    default: ''
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  timeTakenSeconds: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Index to ensure each candidate submits each round at most once
submissionSchema.index({ sucCode: 1, roundNumber: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
