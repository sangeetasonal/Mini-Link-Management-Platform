const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ' }, // Optional: if you want to associate clicks with users
  ipAddress: { type: String, required: true },
  device: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Click', clickSchema);