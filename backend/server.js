const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto'); // For hashing
const Url = require('./models/Url'); // Assuming you have a model for storing URLs
const authRoutes = require('./routes/auth'); // Authentication routes

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

// Function to hash a URL
const hashLongUrl = (longUrl) => {
  const hash = crypto.createHash('sha256').update(longUrl).digest('hex');
  return hash.slice(0, 8); // Generate an 8-character hash
};

// POST: Create a short URL
app.post('/create', async (req, res) => {
  const { longUrl, remarks, expirationDate } = req.body;

  if (!longUrl) {
    return res.status(400).json({ message: 'Long URL is required' });
  }

  try {
    const hashedUrl = hashLongUrl(longUrl);

    // Check if the short URL already exists
    let url = await Url.findOne({ shortUrl: hashedUrl });
    if (url) {
      // If the URL exists, calculate the status dynamically
      const currentTime = new Date();
      const status = url.expirationEnabled && url.expirationDate && currentTime > new Date(url.expirationDate) ? 'Inactive' : 'Active';

      // Return the existing URL along with remarks and status
      return res.status(200).json({
        message: 'Short URL already exists',
        shortUrl: `${req.protocol}://${req.get('host')}/${hashedUrl}`,
        longUrl: url.longUrl,
        remarks: url.remarks,  // Include remarks in the response
        status,  // Include status in the response
      });
    }

    // Determine the initial status based on expiration
    const currentTime = new Date();
    const status = expirationDate && new Date(expirationDate) < currentTime ? 'Inactive' : 'Active';

    // Create a new URL document
    const newShortUrl = new Url({
      longUrl,
      shortUrl: hashedUrl,
      remarks,
      expirationEnabled: !!expirationDate,
      expirationDate,
      status,
    });

    await newShortUrl.save();

    res.status(201).json({
      message: 'Short URL created successfully',
      shortUrl: `${req.protocol}://${req.get('host')}/${hashedUrl}`,
      longUrl,
      remarks,  // Include remarks in the response
      status,
    });
  } catch (err) {
    console.error('Error creating short URL:', err.message);
    res.status(500).json({ message: 'Error creating short URL', error: err.message });
  }
});

// GET: Handle redirection using the short URL
app.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await Url.findOne({ shortUrl: shortId });
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Check if the link is expired
    if (url.expirationEnabled && url.expirationDate && new Date() > new Date(url.expirationDate)) {
      return res.status(410).json({
         message: 'This link has expired' ,
         status: url.status,
         remarks: url.remarks, // Include remarks here
      });
    }

    res.redirect(url.longUrl);
  } catch (err) {
    console.error('Error handling redirection:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
