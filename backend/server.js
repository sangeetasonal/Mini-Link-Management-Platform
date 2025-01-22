const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const cors = require('cors');
// Enable CORS for all domains (you can specify a specific origin as well)


dotenv.config();  // To load environment variables from .env file

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors()); // This should be used after initializing `app`
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

// Add a route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

// Use the auth routes for login/signup
app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port  http://localhost:${PORT}`);
});
