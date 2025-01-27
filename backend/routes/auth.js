const express = require('express');
const { signup, login, updateUserDetails,  getUserDetails, deleteUser ,  handleRedirect , createShortUrl} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

router.put('/update', authMiddleware, updateUserDetails);

// Route to fetch user details
router.get('/details', authMiddleware, getUserDetails);

router.delete('/delete',  authMiddleware, deleteUser);

// Route to create a short URL
router.post('/create', createShortUrl);

// Route to handle redirection
router.get('/:shortId', handleRedirect);



module.exports = router;
