const dataService = require('../services/dataService');

const adminController = {
  async getContestStats(req, res) {
    try {
      const users = await dataService.getAllUsers();
      const submissions = await dataService.getAllSubmissions();
      const config = await dataService.getConfig();

      const r1Count = submissions.filter(s => s.roundNumber === 1).length;
      const r2Count = submissions.filter(s => s.roundNumber === 2).length;
      const r3Count = submissions.filter(s => s.roundNumber === 3).length;
      const fullyCompletedCount = users.filter(u => (u.roundsCompleted || []).length === 3).length;

      return res.json({
        festName: config.festName || 'BCAlgorix',
        leaderboardRevealed: config.leaderboardRevealed,
        totalCandidates: users.length,
        fullyCompletedCandidates: fullyCompletedCount,
        submissionsByRound: {
          round1: r1Count,
          round2: r2Count,
          round3: r3Count
        },
        totalSubmissions: submissions.length
      });
    } catch (err) {
      console.error('getContestStats error:', err);
      return res.status(500).json({ error: 'Failed to retrieve contest statistics.' });
    }
  },

  async getCandidates(req, res) {
    try {
      const users = await dataService.getAllUsers();
      const submissions = await dataService.getAllSubmissions();

      // Build candidate table
      const list = users.map(user => {
        const userSubs = submissions.filter(s => s.sucCode === user.sucCode);
        const r1 = userSubs.find(s => s.roundNumber === 1);
        const r2 = userSubs.find(s => s.roundNumber === 2);
        const r3 = userSubs.find(s => s.roundNumber === 3);

        const completedCount = userSubs.length;
        const avgWpm = completedCount > 0
          ? Math.round((userSubs.reduce((acc, s) => acc + s.wpm, 0) / completedCount) * 10) / 10
          : 0;
        const avgAccuracy = completedCount > 0
          ? Math.round((userSubs.reduce((acc, s) => acc + s.accuracy, 0) / completedCount) * 10) / 10
          : 0;
        const totalTime = userSubs.reduce((acc, s) => acc + s.timeTakenSeconds, 0);
        const avgScore = completedCount > 0
          ? Math.round((userSubs.reduce((acc, s) => acc + s.score, 0) / 3) * 10) / 10
          : 0;

        return {
          id: user._id,
          sucCode: user.sucCode,
          name: user.name,
          createdAt: user.createdAt,
          roundsCompleted: user.roundsCompleted || [],
          hasCompletedAll: completedCount === 3,
          round1: r1 ? { wpm: r1.wpm, accuracy: r1.accuracy, time: r1.timeTakenSeconds, score: r1.score, completedAt: r1.completedAt } : null,
          round2: r2 ? { wpm: r2.wpm, accuracy: r2.accuracy, time: r2.timeTakenSeconds, score: r2.score, completedAt: r2.completedAt } : null,
          round3: r3 ? { wpm: r3.wpm, accuracy: r3.accuracy, time: r3.timeTakenSeconds, score: r3.score, completedAt: r3.completedAt } : null,
          avgWpm,
          avgAccuracy,
          totalTime,
          avgScore
        };
      });

      return res.json({ candidates: list });
    } catch (err) {
      console.error('getCandidates error:', err);
      return res.status(500).json({ error: 'Failed to retrieve candidates list.' });
    }
  },

  async toggleLeaderboard(req, res) {
    try {
      const config = await dataService.getConfig();
      let targetState;
      if (typeof req.body.revealed === 'boolean') {
        targetState = req.body.revealed;
      } else {
        targetState = !config.leaderboardRevealed;
      }

      await dataService.updateConfig({ leaderboardRevealed: targetState });

      return res.json({
        message: targetState
          ? 'Leaderboard is now publicly REVEALED to all candidates!'
          : 'Leaderboard is now SEALED and hidden from candidates.',
        leaderboardRevealed: targetState
      });
    } catch (err) {
      console.error('toggleLeaderboard error:', err);
      return res.status(500).json({ error: 'Failed to toggle leaderboard state.' });
    }
  },

  async getSubmissionInspection(req, res) {
    try {
      const { sucCode, roundNumber } = req.params;
      const sub = await dataService.getSubmission(sucCode, parseInt(roundNumber, 10));
      if (!sub) {
        return res.status(404).json({ error: 'Submission record not found.' });
      }

      return res.json({
        sucCode: sub.sucCode,
        name: sub.name,
        roundNumber: sub.roundNumber,
        originalText: sub.originalText,
        typedText: sub.typedText,
        wpm: sub.wpm,
        accuracy: sub.accuracy,
        timeTakenSeconds: sub.timeTakenSeconds,
        score: sub.score,
        completedAt: sub.completedAt
      });
    } catch (err) {
      console.error('getSubmissionInspection error:', err);
      return res.status(500).json({ error: 'Failed to retrieve submission details.' });
    }
  },

  async getPrompts(req, res) {
    try {
      const config = await dataService.getConfig();
      return res.json({ prompts: config.roundPrompts || [] });
    } catch (err) {
      console.error('getPrompts error:', err);
      return res.status(500).json({ error: 'Failed to retrieve prompts.' });
    }
  },

  async updatePrompts(req, res) {
    try {
      const { prompts } = req.body;
      if (!Array.isArray(prompts) || prompts.length !== 3) {
        return res.status(400).json({ error: 'Exactly 3 round prompts are required.' });
      }

      await dataService.updateConfig({ roundPrompts: prompts });
      return res.json({ message: 'Contest round paragraphs updated in MongoDB Atlas successfully!', prompts });
    } catch (err) {
      console.error('updatePrompts error:', err);
      return res.status(500).json({ error: 'Failed to update round prompts.' });
    }
  }
};

module.exports = adminController;
