const dataService = require('../services/dataService');

const contestController = {
  async getRound(req, res) {
    try {
      const roundNumber = parseInt(req.params.roundNumber, 10);
      if (![1, 2, 3].includes(roundNumber)) {
        return res.status(400).json({ error: 'Invalid round number. Choose 1, 2, or 3.' });
      }

      const user = await dataService.findUserBySuc(req.user.sucCode);
      if (!user) {
        return res.status(404).json({ error: 'Candidate not found.' });
      }

      // Check single attempt constraint
      const alreadyCompleted = (user.roundsCompleted || []).includes(roundNumber);
      if (alreadyCompleted) {
        return res.status(403).json({
          error: `Round ${roundNumber} has already been completed. Under BCAlgorix rules, candidates have a single chance to attempt each round.`,
          isCompleted: true
        });
      }

      // Check previous round completion (Round 2 requires Round 1, Round 3 requires Round 2)
      if (roundNumber > 1 && !(user.roundsCompleted || []).includes(roundNumber - 1)) {
        return res.status(400).json({
          error: `Please complete Round ${roundNumber - 1} before proceeding to Round ${roundNumber}.`
        });
      }

      const config = await dataService.getConfig();
      const promptData = (config.roundPrompts || []).find(p => p.round === roundNumber);
      if (!promptData) {
        return res.status(404).json({ error: `Configuration for Round ${roundNumber} not found.` });
      }

      // Permissions based on round
      const permissions = {
        roundNumber,
        backspaceAllowed: roundNumber === 1 || roundNumber === 2,
        maskAsterisk: roundNumber === 2 || roundNumber === 3,
        textVisible: roundNumber === 1,
        copyPasteBlocked: true,
        contextMenuBlocked: true
      };

      return res.json({
        round: {
          roundNumber: promptData.round,
          title: promptData.title,
          description: promptData.description,
          timeLimit: promptData.timeLimit || 120,
          text: promptData.text,
          permissions
        }
      });
    } catch (err) {
      console.error('getRound error:', err);
      return res.status(500).json({ error: 'Failed to retrieve round data.' });
    }
  },

  async submitRound(req, res) {
    try {
      const { roundNumber, typedText, timeTakenSeconds } = req.body;
      const rNum = parseInt(roundNumber, 10);

      if (![1, 2, 3].includes(rNum)) {
        return res.status(400).json({ error: 'Invalid round number.' });
      }

      const user = await dataService.findUserBySuc(req.user.sucCode);
      if (!user) {
        return res.status(404).json({ error: 'Candidate not found.' });
      }

      // Check single attempt constraint
      const existingSub = await dataService.getSubmission(req.user.sucCode, rNum);
      if (existingSub || (user.roundsCompleted || []).includes(rNum)) {
        return res.status(403).json({
          error: `Round ${rNum} has already been submitted and locked. Re-attempts are not permitted.`
        });
      }

      const config = await dataService.getConfig();
      const promptData = (config.roundPrompts || []).find(p => p.round === rNum);
      if (!promptData) {
        return res.status(404).json({ error: 'Round prompt not found.' });
      }

      const original = promptData.text || '';
      const typed = String(typedText || '').trim();
      const durationSeconds = Math.max(1, Math.min(Number(timeTakenSeconds) || 1, (promptData.timeLimit || 180) + 15));

      // Word-aligned scoring (Monkeytype standard)
      // When a user misses symbols or skips to next word via Space, each word aligns independently!
      const origWords = original.trim().split(/\s+/);
      const typedWords = typed.length > 0 ? typed.split(/\s+/) : [];

      let correctChars = 0;
      let totalTypedChars = 0;

      for (let w = 0; w < origWords.length; w++) {
        const oWord = origWords[w];
        const tWord = typedWords[w] || '';

        totalTypedChars += tWord.length;

        const charLen = Math.min(oWord.length, tWord.length);
        for (let c = 0; c < charLen; c++) {
          if (oWord[c] === tWord[c]) {
            correctChars++;
          }
        }

        // Account for correctly completed space transitions
        if (w < origWords.length - 1 && w < typedWords.length - 1 && tWord.length > 0) {
          totalTypedChars++; // space
          correctChars++; // space matched
        }
      }

      // Total characters attempted is the max of total typed characters or correct characters
      const effectiveTyped = Math.max(totalTypedChars, typed.replace(/\s+/g, ' ').length);

      // Accuracy: percentage of correct characters relative to what was typed (or original prompt length)
      let accuracyPercent = 0;
      if (effectiveTyped > 0) {
        accuracyPercent = Math.max(0, Math.min(100, Math.round((correctChars / effectiveTyped) * 1000) / 10));
      }

      // Net WPM: (correct keystrokes / 5) / (duration in minutes)
      const minutes = durationSeconds / 60;
      const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
      const grossWpm = Math.max(0, Math.round((effectiveTyped / 5) / minutes));

      // Composite contest score
      const compositeScore = Math.max(0, Math.round(((netWpm * 0.55) + (accuracyPercent * 0.45)) * 10) / 10);

      const submission = await dataService.createSubmission({
        userId: user._id,
        sucCode: user.sucCode,
        name: user.name,
        roundNumber: rNum,
        originalText: original,
        typedText: typed,
        wpm: netWpm,
        grossWpm,
        accuracy: accuracyPercent,
        timeTakenSeconds: Math.round(durationSeconds),
        score: compositeScore
      });

      // Update candidate's completed rounds
      await dataService.addCompletedRound(user._id, rNum);

      return res.status(201).json({
        message: `Round ${rNum} completed and submitted successfully!`,
        result: {
          roundNumber: rNum,
          wpm: netWpm,
          grossWpm,
          accuracy: accuracyPercent,
          timeTakenSeconds: Math.round(durationSeconds),
          score: compositeScore,
          completedAt: submission.completedAt
        }
      });
    } catch (err) {
      console.error('submitRound error:', err);
      return res.status(500).json({ error: 'Failed to submit round.' });
    }
  }
};

module.exports = contestController;
