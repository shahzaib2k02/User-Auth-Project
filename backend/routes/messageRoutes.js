// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/send', authMiddleware.authenticateToken, messageController.sendMessage);
router.get('/retrieve', authMiddleware.authenticateToken, messageController.getMessages);

module.exports = router;
