const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireCandidateAuth } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.get('/me', requireCandidateAuth, authController.getMe);

module.exports = router;
