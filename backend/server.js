const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto'); // For hashing
const Url = require('./models/Url'); // Assuming you have a model for storing URLs
const authRoutes = require('./routes/auth'); // Authentication routes
const linkRoutes = require('./routes/auth'); // Import the new routes
const cron = require('node-cron'); // Import node-cron

dotenv.config(); // Load environment variables from .env file

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


// Middleware to log and format the IP address
app.use((req, res, next) => {
  // Get the IP address
  let ip = req.ip;

  // Convert IPv6 localhost (::1) to IPv4 (127.0.0.1)
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  // Log the IP address
  console.log(`Request received from IP: ${ip}`);
  next();
});



  // Schedule a job to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    // Update links that have expired
    const result = await Url.updateMany(
      { expirationDate: { $lt: now }, status: 'Active' },
      { status: 'Inactive' }
    );

    console.log(`Updated ${result.nModified} links to inactive status.`);
  } catch (error) {
    console.error('Error updating inactive links:', error);
  }
});

// Add a route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

// Use the auth routes for login/signup
app.use('/api/auth', authRoutes);






// Add the new route middleware
app.use(linkRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
