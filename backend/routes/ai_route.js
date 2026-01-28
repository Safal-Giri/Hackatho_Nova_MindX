const express = require('express');
const router = express.Router();
const aiController = require('../controller/ai_controller');
const auth = require('../middleware/auth');

router.post('/ai/summarize', auth, aiController.summarizeConversation);

module.exports = router;
