const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  // Store face descriptor as an array of numbers
  descriptor: {
    type: [Number],
    required: true
  },
  relatedTo: {
    type: String,
    required: true
  }
},
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Person', PersonSchema);
