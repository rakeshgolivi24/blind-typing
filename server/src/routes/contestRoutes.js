const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { requireCandidateAuth } = require('../middleware/authMiddleware');

router.get('/round/:roundNumber', requireCandidateAuth, contestController.getRound);
router.post('/submit', requireCandidateAuth, contestController.submitRound);

module.exports = router;
