const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dose: { type: String, required: true },
    schedule: { type: String, required: true }, // e.g., 'Daily', 'Weekly'
    time: { type: String, required: true }, // e.g., '08:00', '20:30'
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
