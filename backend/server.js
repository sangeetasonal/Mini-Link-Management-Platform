const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto'); // For hashing
const Url = require('./models/Url'); // Assuming you have a model for storing URLs
const authRoutes = require('./routes/auth'); // Authentication routes
const linkRoutes = require('./routes/auth'); // Import the new routes

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
