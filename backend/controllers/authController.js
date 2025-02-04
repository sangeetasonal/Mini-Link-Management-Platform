const User = require('../models/User');
const Url = require("../models/Url");
const crypto = require("crypto"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Click = require('../models/Click');
// Signup function
exports.signup = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, mobile, password });
    await user.save();

    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

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
  const userId = req.user?.userId; 

  try {
    
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


// Update a short URL
exports.updateShortUrl = async (req, res) => {
  const { urlId } = req.params; 
  const { remarks, expirationDate } = req.body; 
  const userId = req.user?.userId; 

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  try {
   
    const updatedUrl = await Url.findOneAndUpdate(
      { _id: urlId, userId },
      { remarks, expirationDate: expirationDate ? new Date(expirationDate) : null },
      { new: true, runValidators: true } 
    );

    if (!updatedUrl) {
      return res.status(404).json({ message: "URL not found or you do not have permission to update it" });
    }

    res.status(200).json({
      message: "Short URL updated successfully",
      url: updatedUrl, 
    });
  } catch (err) {
    console.error("Error updating URL:", err.message);
    res.status(500).json({ message: "Error updating URL", error: err.message });
  }
};


// Function to hash a URL
const hashLongUrl = (longUrl) => {
  const timestamp = Date.now(); 
  return crypto.createHash('sha256').update(longUrl + timestamp).digest('hex').slice(0, 8); // Generate a hash
};


// Create a short URL
// Create a short URL
exports.createShortUrl = async (req, res) => {
  const { longUrl, remarks, expirationDate } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  if (!longUrl) {
    return res.status(400).json({ message: 'Long URL is required' });
  }

  try {
    const hashedUrl = hashLongUrl(longUrl);
    const shortUrl = `${process.env.BASE_URL}/${hashedUrl}`; // Ensure there's only one slash

    // Log the short URL for debugging
    console.log("Generated Short URL:", shortUrl);

    const newShortUrl = new Url({
      longUrl,
      shortUrl,
      remarks,
      expirationDate: expirationDate ? new Date(expirationDate) : null, // Store expiration date
      createdAt: new Date(),
      status: expirationDate && new Date(expirationDate) < new Date() ? 'Inactive' : 'Active',
      userId
    });

    await newShortUrl.save();

    res.status(201).json({
      message: 'Short URL created successfully',
      shortUrl,
      longUrl,
      remarks,
      createdAt: newShortUrl.createdAt,
      status: newShortUrl.status,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating short URL', error: err.message });
  }
};
// Handle redirection
exports.handleRedirect = async (req, res) => {
  const { shortId } = req.params;
  const shortUrl = `${process.env.BASE_URL}/${shortId}`;

  console.log("Redirect handler called for shortId:", shortId);

  try {
      const url = await Url.findOne({ shortUrl });

      if (!url) {
          return res.status(404).json({ message: 'Short URL not found' });
      }

      if (url.status === 'Inactive' || (url.expirationDate && new Date() > url.expirationDate)) {
          return res.status(410).json({ message: 'This link has expired and is no longer valid.' });
      }

      let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if (ipAddress.includes(',')) {
          ipAddress = ipAddress.split(',')[0]; // Extract real IP if multiple are listed
      }
      if (ipAddress === '::1') {
          ipAddress = '127.0.0.1';
      }

      const userAgent = req.headers['user-agent'];
      const device = getDevice(userAgent);

      console.log("Request IP:", ipAddress);
      console.log("User-Agent:", userAgent);
      console.log("Device:", device);

      // Update URL document
      const updatedUrl = await Url.findOneAndUpdate(
          { shortUrl },
          { 
              $set: { ipAddress, device },
              $inc: { clicks: 1 }
          },
          { new: true }
      );

      console.log("Updated URL after click:", updatedUrl);

      res.redirect(url.longUrl);
  } catch (err) {
      console.error("Error during redirection:", err.message);
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
  const userId = req.user?.userId; 
  const page = parseInt(req.query.page) || 1; 
  const limit = 10; // Items per page
  const offset = (page - 1) * limit; 

  try {
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
      urls,
      totalUrls, 
      totalPages: Math.ceil(totalUrls / limit),
      currentPage: page, 
    });
  } catch (err) {
    console.error("Error fetching URLs:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a short URL
exports.deleteShortUrl = async (req, res) => {
  const userId = req.user?.userId;
  const { urlId } = req.params; 

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  try {
    
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



// Update a short URL
exports.updateShortUrl = async (req, res) => {
  const { urlId } = req.params; 
  const { remarks, expirationDate } = req.body; 
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  try {
    // Find the URL by ID and ensure it belongs to the user
    const updatedUrl = await Url.findOneAndUpdate(
      { _id: urlId, userId },
      { remarks, expirationDate: expirationDate ? new Date(expirationDate) : null },
      { new: true, runValidators: true } 
    );

    if (!updatedUrl) {
      return res.status(404).json({ message: "URL not found or you do not have permission to update it" });
    }

    res.status(200).json({
      message: "Short URL updated successfully",
      url: updatedUrl, 
    });
  } catch (err) {
    console.error("Error updating URL:", err.message);
    res.status(500).json({ message: "Error updating URL", error: err.message });
  }
};


// Fetch click data for the authenticated user
exports.getActiveClickData = async (req, res) => {
  const userId = req.user?.userId; 
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = 10; 
  const offset = (page - 1) * limit; 

  console.log("User   ID:", userId); 

  try {
    // Find all URLs associated with the user
   const urls = await Url.find({ 
            userId, 
            clicks: { $gt: 0 } // Only fetch URLs with clicks greater than 0
        })
      .skip(offset) 
      .limit(limit)
      .sort({ createdAt: -1 }); 


      
    // Create the response array
    const responseUrls = urls.map(url => {
      return {
        longUrl: url.longUrl,
        shortUrl: url.shortUrl,
        ipAddress: url.clicks > 0 ? url.ipAddress : 'Not opened', 
        device: url.clicks > 0 ? url.device : 'Not opened', 
        clicks: url.clicks, 
        createdAt: url.createdAt 
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
      totalUrls, 
      totalPages, 
      currentPage: page, 
    });
  } catch (err) {
    console.error("Error fetching active URL data:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

