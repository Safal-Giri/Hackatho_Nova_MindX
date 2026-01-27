const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
