const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  User_ID: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
