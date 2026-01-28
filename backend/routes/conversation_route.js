const express = require('express');
const router = express.Router();
const conversationController = require('../controller/conversation_controller');
const auth = require('../middleware/auth');

// Add conversation summary
router.post('/conversations', auth, conversationController.saveConversation);

// Get latest conversation for a person
router.get('/conversations/person/:personId/latest', auth, conversationController.getConversation);

// Get all conversations for the logged in user
router.get('/conversations/user', auth, conversationController.getUserConversations);

module.exports = router;

