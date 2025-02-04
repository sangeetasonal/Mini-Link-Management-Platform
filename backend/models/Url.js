const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  remarks: { type: String },
  expirationEnabled: { type: Boolean, default: false },
  expirationDate: { type: Date },
  createdAt: { type: Date, default: Date.now }, // Automatically set to current date
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }, // Track link status
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true }, // Reference to User
  clicks: { type: Number, default: 0 }, // Add clicks field
  ipAddress: { type: String }, // Optional: Default value
  device: { type: String } // Optional: Default value
});

module.exports = mongoose.model('Url', UrlSchema);
