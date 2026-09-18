const dataService = require('../services/dataService');

const leaderboardController = {
  async getLeaderboard(req, res) {
    try {
      const config = await dataService.getConfig();
      const isAdmin = req.user && req.user.role === 'admin';

      // If hidden and not admin, return sealed notice
      if (!config.leaderboardRevealed && !isAdmin) {
        return res.json({
          revealed: false,
          festName: config.festName || 'BCAlgorix',
          message: 'The BCAlgorix official leaderboard is currently sealed. Organizers will reveal the final standings once all candidate rounds conclude.'
        });
      }

      const users = await dataService.getAllUsers();
      const submissions = await dataService.getAllSubmissions();

      // Group submissions by candidate SUC code
      const candidateMap = {};

      for (const u of users) {
        candidateMap[u.sucCode] = {
          sucCode: u.sucCode,
          name: u.name,
          roundsCompleted: u.roundsCompleted || [],
          rounds: {},
          totalRounds: 0,
          totalWpm: 0,
          totalAccuracy: 0,
          totalTime: 0,
          totalScore: 0
        };
      }

      for (const sub of submissions) {
        if (!candidateMap[sub.sucCode]) {
          candidateMap[sub.sucCode] = {
            sucCode: sub.sucCode,
            name: sub.name,
            roundsCompleted: [sub.roundNumber],
            rounds: {},
            totalRounds: 0,
            totalWpm: 0,
            totalAccuracy: 0,
            totalTime: 0,
            totalScore: 0
          };
        }

        const cand = candidateMap[sub.sucCode];
        cand.rounds[sub.roundNumber] = {
          wpm: sub.wpm,
          accuracy: sub.accuracy,
          timeTakenSeconds: sub.timeTakenSeconds,
          score: sub.score,
          completedAt: sub.completedAt
        };
      }

      // Compute averages
      const leaderboardList = Object.values(candidateMap).map(cand => {
        const attemptedRounds = Object.keys(cand.rounds).map(Number);
        const count = attemptedRounds.length;

        let sumWpm = 0;
        let sumAcc = 0;
        let sumTime = 0;
        let sumScore = 0;

        for (const rNum of attemptedRounds) {
          const r = cand.rounds[rNum];
          sumWpm += r.wpm;
          sumAcc += r.accuracy;
          sumTime += r.timeTakenSeconds;
          sumScore += r.score;
        }

        // Averaged over the 3 rounds
        // Candidates who finished all 3 rounds are evaluated on 3-round average
        const avgDivisor = count > 0 ? count : 1;
        const avgWpm = count > 0 ? Math.round((sumWpm / avgDivisor) * 10) / 10 : 0;
        const avgAccuracy = count > 0 ? Math.round((sumAcc / avgDivisor) * 10) / 10 : 0;
        const avgTime = count > 0 ? Math.round((sumTime / avgDivisor) * 10) / 10 : 0;
        // Final score averages the completed rounds, with full completion weighting
        const avgScore = count > 0 ? Math.round((sumScore / 3) * 10) / 10 : 0;

        return {
          sucCode: cand.sucCode,
          name: cand.name,
          roundsAttempted: count,
          hasCompletedAllRounds: count === 3,
          roundDetails: cand.rounds,
          avgWpm,
          avgAccuracy,
          totalTime: sumTime,
          avgTime,
          finalScore: avgScore
        };
      });

      // Sort: Completed all 3 rounds first, then by finalScore desc, avgWpm desc, avgAccuracy desc, totalTime asc
      leaderboardList.sort((a, b) => {
        // Prioritize candidates who completed all 3 rounds
        if (a.hasCompletedAllRounds !== b.hasCompletedAllRounds) {
          return b.hasCompletedAllRounds ? 1 : -1;
        }
        if (b.finalScore !== a.finalScore) {
          return b.finalScore - a.finalScore;
        }
        if (b.avgWpm !== a.avgWpm) {
          return b.avgWpm - a.avgWpm;
        }
        if (b.avgAccuracy !== a.avgAccuracy) {
          return b.avgAccuracy - a.avgAccuracy;
        }
        return a.totalTime - b.totalTime;
      });

      // Assign ranks & elevation badges
      const ranked = leaderboardList.map((item, index) => {
        const rank = index + 1;
        let podiumTier = null;
        if (rank === 1) podiumTier = 'gold';
        else if (rank === 2) podiumTier = 'silver';
        else if (rank === 3) podiumTier = 'bronze';

        return {
          ...item,
          rank,
          podiumTier
        };
      });

      return res.json({
        revealed: config.leaderboardRevealed,
        festName: config.festName || 'BCAlgorix',
        totalParticipants: ranked.length,
        top3: ranked.slice(0, 3),
        leaderboard: ranked
      });
    } catch (err) {
      console.error('getLeaderboard error:', err);
      return res.status(500).json({ error: 'Failed to generate leaderboard.' });
    }
  }
};

module.exports = leaderboardController;
