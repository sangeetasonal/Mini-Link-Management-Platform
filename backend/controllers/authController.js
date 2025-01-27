const User = require('../models/User');
const Url = require("../models/Url");
const crypto = require("crypto"); // Import the crypto module for generating IDs

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup function
exports.signup = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Create new user
    const user = new User({ name, email, mobile, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ message: "Login successful", token , name: user.name});
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

exports.updateUserDetails = async (req, res) => {
  console.log("Update User Endpoint Hit");
  console.log("UserID from Token:", req.user?.userId);
  console.log("Request Body:", req.body);

  const userId = req.user?.userId;
  const { name, email, mobile } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, mobile },
      { new: true, runValidators: true }
    );

    console.log("Updated User:", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
      },
    });
  } catch (err) {
    console.error("Error Updating User:", err.message);
    res.status(500).json({ message: "Error updating user details", error: err.message });
  }
};


exports.getUserDetails = async (req, res) => {
  const userId = req.user?.userId; // Extract userId from the token in authMiddleware

  try {
    // Find the user by ID and select specific fields
    const user = await User.findById(userId).select('name email mobile');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user details", error: err.message });
  }
};


exports.deleteUser = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  try {
    // Delete the user from the database
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User account deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ message: "Error deleting user account", error: err.message });
  }
};





// Function to hash a URL
const hashLongUrl = (longUrl) => {
  const hash = crypto.createHash('sha256').update(longUrl).digest('hex');
  return hash.slice(0, 8); // Generate an 8-character hash
};

// Create a short URL
// Create a short URL
exports.createShortUrl = async (req, res) => {
  const { longUrl, remarks, expirationDate } = req.body;

  if (!longUrl) {
    return res.status(400).json({ message: 'Long URL is required' });
  }

  try {
    const hashedUrl = hashLongUrl(longUrl);

    // Check if the short URL already exists
    let url = await Url.findOne({ shortUrl: hashedUrl });
    if (url) {
      // Calculate the status dynamically
      const currentTime = new Date();
      const status = url.expirationEnabled && url.expirationDate && currentTime > url.expirationDate ? 'Inactive' : 'Active';

      // Return the existing URL along with remarks and status
      return res.status(200).json({
        message: 'Short URL already exists',
        shortUrl: `${req.protocol}://${req.get('host')}/${hashedUrl}`,
        longUrl: url.longUrl,
        remarks,
        status, // Include the current status
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
      remarks,
      status,
    });
  } catch (err) {
    console.error('Error creating short URL:', err.message);
    res.status(500).json({ message: 'Error creating short URL', error: err.message });
  }
};

// Handle redirection
exports.handleRedirect = async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await Url.findOne({ shortUrl: shortId });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Check if the link is expired
    const currentTime = new Date();
    if (url.expirationEnabled && url.expirationDate && currentTime > new Date(url.expirationDate)) {
      url.status = 'Inactive';  // Set status as Inactive when expired
      await url.save();

      return res.status(410).json({
        message: 'This link has expired',
        status: url.status, // Include status (Inactive)
        remarks: url.remarks, // Include remarks
      });
    }

    // If not expired, redirect to the original URL
    res.redirect(url.longUrl);
  } catch (err) {
    console.error('Error handling redirection:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
