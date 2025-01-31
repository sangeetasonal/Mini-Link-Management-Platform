const User = require('../models/User');
const Url = require("../models/Url");
const crypto = require("crypto"); // Import the crypto module for generating IDs
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Click = require('../models/Click');
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
  const timestamp = Date.now(); // Get the current timestamp
  return crypto.createHash('sha256').update(longUrl + timestamp).digest('hex').slice(0, 8); // Generate a hash
};


// Create a short URL
 // Create a short URL
 exports.createShortUrl = async (req, res) => {
  console.log("User  ID from request:", req.user?.userId); // Debug log

  const { longUrl, remarks, expirationDate } = req.body;
  const userId = req.user?.userId; // Get userId from the authenticated request
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  if (!longUrl) {
    return res.status(400).json({ message: 'Long URL is required' });
  }

  try {
    const hashedUrl = hashLongUrl(longUrl); // Generate a unique hash for the URL
    const shortUrl = `${req.protocol}://${req.get("host")}/${hashedUrl}`; // Full clickable link

    // Remove the check for existing short URL
    // This allows the creation of a new short URL even if the original link is the same

    const status = expirationDate && new Date(expirationDate) < new Date() ? 'Inactive' : 'Active';

    // Create a new URL document with userId
    const newShortUrl = new Url({
      longUrl,
      shortUrl,
      remarks,
      expirationEnabled: !!expirationDate,
      expirationDate,
      createdAt: new Date(),
      status,
      userId // Associate the URL with the user
    });

    await newShortUrl.save();

    res.status(201).json({
      message: 'Short URL created successfully',
      shortUrl,
      longUrl,
      remarks,
      createdAt: newShortUrl.createdAt,
      status,
    });
  } catch (err) {
    console.error('Error creating short URL:', err.message);
    res.status(500).json({ message: 'Error creating short URL', error: err.message });
  }
};

// Handle redirection
// Handle redirection
exports.handleRedirect = async (req, res) => {
  const { shortId } = req.params;
  const shortUrl = `${req.protocol}://${req.get("host")}/${shortId}`;

  try {
    const url = await Url.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Increment the click count
    url.clicks += 1;

    // Store IP address and device information
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const device = getDevice(userAgent);

    // Log the IP address and device information
    console.log(`IP Address: ${ipAddress}`); // Log the IP address
    console.log(`Device: ${device}`); // Log the device information
    // Update the URL document with IP address and device
    url.ipAddress = ipAddress; // Update IP address
    url.device = device; // Update device

    // Save the updated URL document
    await url.save();

    console.log(`URL opened: ${url.longUrl}, Device: ${device}, IP: ${ipAddress}`);

    res.redirect(url.longUrl);
  } catch (err) {
    console.error('Error during redirection:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Function to get device from user agent
function getDevice(userAgent) {
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Macintosh')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown'; // Default case if no match is found
}
// Fetch all URLs created by the authenticated user with pagination
exports.getUserUrls = async (req, res) => {
  const userId = req.user?.userId; // Extract userId from the token in authMiddleware
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = 10; // Items per page
  const offset = (page - 1) * limit; // Calculate offset

  try {
    // Retrieve URLs created by the user with pagination
    const urls = await Url.find({ userId })
      .sort({ createdAt: -1 }) // Sort by creation date
      .skip(offset) // Skip the previous pages
      .limit(limit); // Limit the number of results

    const totalUrls = await Url.countDocuments({ userId }); // Get total count of URLs

    if (!urls.length) {
      return res.status(404).json({ message: "No URLs found for this user" });
    }

    res.status(200).json({
      message: "Fetched all URLs successfully",
      urls, // Returning the paginated URLs created by the user
      totalUrls, // Total number of URLs for pagination
      totalPages: Math.ceil(totalUrls / limit), // Total number of pages
      currentPage: page, // Current page number
    });
  } catch (err) {
    console.error("Error fetching URLs:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a short URL
exports.deleteShortUrl = async (req, res) => {
  const userId = req.user?.userId; // Get userId from the authenticated request
  const { urlId } = req.params; // Get the URL ID from the request parameters

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  try {
    // Find the URL by ID and ensure it belongs to the user
    const url = await Url.findOneAndDelete({ _id: urlId, userId });

    if (!url) {
      return res.status(404).json({ message: "URL not found or you do not have permission to delete it" });
    }

    res.status(200).json({ message: "Short URL deleted successfully" });
  } catch (err) {
    console.error("Error deleting URL:", err.message);
    res.status(500).json({ message: "Error deleting URL", error: err.message });
  }
};




// Fetch click data for the authenticated user
exports.getActiveClickData = async (req, res) => {
  const userId = req.user?.userId; // Extract userId from the token in authMiddleware
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = 10; // Items per page
  const offset = (page - 1) * limit; // Calculate offset

  console.log("User   ID:", userId); // Log the user ID

  try {
    // Find all URLs associated with the user
    const urls = await Url.find({ userId })
      .skip(offset) // Skip the previous pages for URLs
      .limit(limit) // Limit the number of results for URLs
      .sort({ createdAt: -1 }); // Sort by creation date


      
    // Create the response array
    const responseUrls = urls.map(url => {
      return {
        longUrl: url.longUrl,
        shortUrl: url.shortUrl,
        ipAddress: url.clicks > 0 ? url.ipAddress : 'Not opened', // Set to 'Not opened' if no clicks
        device: url.clicks > 0 ? url.device : 'Not opened', // Set to 'Not opened' if no clicks
        clicks: url.clicks, // Include the click count
        createdAt: url.createdAt // Include the creation date
      };
    });

    // Get total count of URLs for pagination
    const totalUrls = await Url.countDocuments({ userId });

    // Calculate total pages for URLs
    const totalPages = Math.ceil(totalUrls / limit);

    // Log the final response
    console.log("Response URLs:", responseUrls);

    res.status(200).json({
      message: "Fetched active URL data successfully",
      urls: responseUrls,
      totalUrls, // Total number of URLs for pagination
      totalPages, // Total pages for URLs
      currentPage: page, // Current page for URLs
    });
  } catch (err) {
    console.error("Error fetching active URL data:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

