const Conversation = require('../models/conversation_model');

exports.saveConversation = async (req, res) => {
  try {
    const { personId, summary } = req.body;

    if (!personId || !summary) {
      return res.status(400).json({ error: 'PersonId and summary are required' });
    }

    const newConv = new Conversation({
      personId,
      summary
    });

    const savedConv = await newConv.save();
    res.status(201).json(savedConv);
  } catch (err) {
    console.error('Error saving conversation:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { personId } = req.params;

    // Find latest conversation
    const conversation = await Conversation.findOne({ personId })
      .sort({ date: -1 }); // Newest first

    if (!conversation) {
      return res.json({ summary: 'No previous conversations recorded.', date: null });
    }

    res.json(conversation);
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
