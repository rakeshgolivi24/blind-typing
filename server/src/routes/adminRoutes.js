const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/stats', requireAdminAuth, adminController.getContestStats);
router.get('/candidates', requireAdminAuth, adminController.getCandidates);
router.post('/toggle-leaderboard', requireAdminAuth, adminController.toggleLeaderboard);
router.get('/inspect/:sucCode/:roundNumber', requireAdminAuth, adminController.getSubmissionInspection);
router.get('/prompts', requireAdminAuth, adminController.getPrompts);
router.put('/prompts', requireAdminAuth, adminController.updatePrompts);

module.exports = router;
