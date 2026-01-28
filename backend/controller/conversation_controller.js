const Conversation = require('../models/conversation_model');

exports.saveConversation = async (req, res) => {
  try {
    const { personId, summary } = req.body;
    const username = req.user.username; // From auth middleware

    if (!personId || !summary) {
      return res.status(400).json({ error: 'PersonId and summary are required' });
    }

    const newConv = new Conversation({
      personId,
      summary,
      username
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
      .sort({ createdAt: -1 }); // Newest first

    if (!conversation) {
      return res.json({ summary: 'No previous conversations recorded.', date: null });
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
    const conversations = await Conversation.find({ username })
      .populate('personId', 'name') // Assuming personId refers to Person model and it has a name field
      .sort({ createdAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error('Error fetching user conversations:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

