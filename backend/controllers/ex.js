// const express = require("express");
// const router = express.Router();
// const User = require("../schema/user.schema");
// const Url = require("../schema/url.schema");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// dotenv.config();
// const authenticate = require('../middleware/auth');
// const customNanoid = async () => {
//     const { customAlphabet } = await import('nanoid');
//     return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8); // 8-character nanoid
// };


// // Register route
// router.post("/register", async (req, res) => {
//     const { username, email, mobile,password, confirmPassword } = req.body;
//     if (password !== confirmPassword) {
//         return res.status(400).json({ message: "Passwords do not match" });
//     }
//     const isUserExist = await User.findOne({ email });
//     if (isUserExist) {
//         return res.status(400).json({ message: "User already exist" });
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     try {
//         const user = await User.create({
//             username,
//             email,
//             mobile,
//             password: hashedPassword,
//         });
//         res.status(200).json({ message: "User created" });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: "Error in creating user" });
//     }
// });

// // Login route
// router.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//         return res.status(400).json({ message: "Wrong username or password" });
//     }
//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//         return res.status(400).json({ message: "Wrong username or password" });
//     }
//     const payload = {
//         id: user._id,
//     };
//     const username = user.username;
//     const token = jwt.sign(payload, process.env.JWT_SECRET);
//     res.status(200).json({ token, username, message: "Login successfully" });
// });

// // Update user route

// router.post("/update", async (req, res) => {
//     const { username, email, mobile } = req.body;
//     console.log("Request Body:", req.body); // Debugging step

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: "User not found" });
//         }        
//         if (username && username !== user.username) {
//             user.username = username;
//         }
        
//         if (email && email !== user.email) {
//             const isEmailTaken = await User.findOne({ email });
//             if (isEmailTaken) {
//                 return res.status(400).json({ message: "Email is already in use" });
//             }
//             user.email = email;
//         }
        
//         if (mobile && mobile !== user.mobile) {
//             user.mobile = mobile;
//         }        
//         await user.save();

//         res.status(200).json({ message: "User information updated successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error updating user information" });
//     }
// });

// // Get user info
// router.use(authenticate);

// router.get("/user-details", async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id).select("-password"); // Exclude password
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }
//         res.status(200).json({
//             username: user.username,
//             email: user.email,
//             mobile: user.mobile,
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// // Delete user
// router.use(authenticate);
// router.delete("/delete-user", async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.user.id);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }
//         res.status(200).json({ message: "User deleted successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// // Shorten URL
// router.post("/short", async (req, res) => {
//     try {
//         const { originUrl, remarks, linkExpire } = req.body;

        
//         if (!originUrl) {
//             return res.status(400).json({ message: "Origin URL is required" });
//         }
       
//         const generateNanoid = await customNanoid();
//         const shortUrl = generateNanoid();

        
//         const url = new Url({
//             originUrl,
//             shortUrl,
//             remarks,
//             linkExpire: linkExpire ? new Date(linkExpire) : null, 
//         });
//          console.log(url);
//         await url.save();

        
//         res.status(200).json({
//             message: "URL generated successfully",
//             url,
//         });
//     } catch (err) {
//         console.error(Error in /short route:, err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// // Redirect short URL
// router.get("/:shortUrl", async (req, res) => {
//     try {
//         const { shortUrl } = req.params;

        
//         const url = await Url.findOne({ shortUrl });
     
//         if (!url) {
//             return res.status(404).json({ message: "Short URL not found" });
//         }       

//         url.clicks += 1;
//         await url.save();      
//         return res.redirect(url.originUrl);
//     } catch (err) {
//         console.error(Error in redirection route:, err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// //delete link
// router.delete("/link/:id", async (req, res) => {
//     try {
//         const { id } = req.params; // Extract the link ID from the URL

//         if (!id) {
//             return res.status(400).json({ message: "Link ID is required" });
//         }

//         // Find the URL by ID
//         const url = await Url.findById(id);

//         if (!url) {
//             return res.status(404).json({ message: "URL not found" });
//         }

//         // Delete the URL from the database
//         await Url.findByIdAndDelete(id);

//         res.status(200).json({
//             message: "URL deleted successfully",
//             url: {
//                 originUrl: url.originUrl,
//                 shortUrl: url.shortUrl,
//                 remarks: url.remarks,
//                 linkExpire: url.linkExpire,
//                 clicks: url.clicks,
//                 _id: url._id
//             }
//         });
//     } catch (err) {
//         console.error(Error in DELETE /link/:id route:, err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// // Update link
// router.patch("/link/:id", async (req, res) => {
//     try {
//         const { id } = req.params; 
//         const { originUrl, remarks, linkExpire } = req.body; 

//         if (!id) {
//             return res.status(400).json({ message: "Link ID is required" });
//         }

        
//         const url = await Url.findById(id);

//         if (!url) {
//             return res.status(404).json({ message: "URL not found" });
//         }

        
//         if (originUrl) url.originUrl = originUrl;
//         if (remarks) url.remarks = remarks;
//         if (linkExpire) url.linkExpire = new Date(linkExpire);

        
//         const updatedUrl = await url.save();

//         res.status(200).json({
//             message: "URL updated successfully",
//             url: {
//                 originUrl: updatedUrl.originUrl,
//                 shortUrl: updatedUrl.shortUrl,
//                 remarks: updatedUrl.remarks,
//                 linkExpire: updatedUrl.linkExpire,
//                 clicks: updatedUrl.clicks,
//                 _id: updatedUrl._id,
//             },
//         });
//     } catch (err) {
//         console.error(Error in PATCH /link/:id route:, err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// router.get("/short-info/:shortUrl", async (req, res) => {
//     try {
//         const { shortUrl } = req.params; // Access path parameter
//         if (!shortUrl) {
//             return res.status(400).json({ message: "Short URL is required" });
//         }

//         const url = await Url.findOne({ shortUrl });
//         if (!url) {
//             return res.status(404).json({ message: "Short URL not found" });
//         }

//         res.status(200).json({
//             originUrl: url.originUrl,
//             shortUrl: url.shortUrl,
//             remarks: url.remarks,
//             clicks: url.clicks,
//             linkExpire: url.linkExpire,
//         });
//     } catch (err) {
//         console.error("Error in /short-info route:", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// });






// module.exports = router;