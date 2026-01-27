const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // Store face descriptor as an array of numbers
  descriptor: {
    type: [Number],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  relatedTo: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Person', PersonSchema);
