const express = require('express');
const router = express.Router();
const conversationController = require('../controller/conversation_controller');

// Add conversation summary
router.post('/conversation', conversationController.saveConversation);

// Get latest conversation for a person
router.get('/conversation/:personId', conversationController.getConversation);

module.exports = router;
