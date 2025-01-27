const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  remarks: { type: String },
  expirationEnabled: { type: Boolean, default: false },
  expirationDate: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }, // Track link status
});

module.exports = mongoose.model('Url', UrlSchema);
