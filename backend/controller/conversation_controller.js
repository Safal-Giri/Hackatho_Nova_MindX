const Conversation = require('../models/conversation_model');

exports.saveConversation = async (req, res) => {
  try {
    const { personId, summary } = req.body;
    const username = req.user.username;

    if (!personId || !summary) {
      return res.status(400).json({ error: 'PersonId and summary are required' });
    }

    const newConv = new Conversation({
      username,
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

    // Find latest conversation for this person
    const conversation = await Conversation.findOne({ personId })
      .sort({ createdAt: -1 }); // Newest first

    if (!conversation) {
      return res.json({ summary: 'No previous conversations recorded.', createdAt: null });
    }

    res.json(conversation);
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const username = req.user.username;

    // Find all conversations for this user, populate person details
    const conversations = await Conversation.find({ username })
      .populate('personId', 'name relationship image')
      .sort({ createdAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error('Error fetching user conversations:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
