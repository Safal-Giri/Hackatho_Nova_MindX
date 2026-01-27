const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    relationship: { type: String, default: '' },
    visitFrequency: { type: String, default: '' },
    faceDescriptors: {
      type: [[Number]], // array of Float32 arrays
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Person', personSchema);
