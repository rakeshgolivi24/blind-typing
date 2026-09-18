const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/stats', requireAdminAuth, adminController.getContestStats);
router.get('/candidates', requireAdminAuth, adminController.getCandidates);
router.post('/toggle-leaderboard', requireAdminAuth, adminController.toggleLeaderboard);
router.get('/inspect/:sucCode/:roundNumber', requireAdminAuth, adminController.getSubmissionInspection);

module.exports = router;
