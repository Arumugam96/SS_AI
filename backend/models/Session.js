const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  session_ID: {
    type: String,
    required: true,
    unique: true
  },
  User_ID: {
    type: String,
    required: true
  },
  prompts: [{
    prompt: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    search_internet: Boolean,
    attachment: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
