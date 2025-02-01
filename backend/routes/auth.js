const express = require('express');
const { 
    signup, 
    login,
    updateUserDetails, 
    getUserDetails,
    deleteUser , 
    handleRedirect ,
    createShortUrl ,
    getUserUrls,
    deleteShortUrl,
    getActiveClickData,
    updateShortUrl    } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// User routes
router.post('/signup', signup);
router.post('/login', login);
router.put('/update', authMiddleware, updateUserDetails);
router.get('/details', authMiddleware, getUserDetails);
router.delete('/delete',  authMiddleware, deleteUser);


// URL routes
router.post('/create', authMiddleware, createShortUrl);
router.get('/all', authMiddleware, getUserUrls); 
router.get('/clicks', authMiddleware, getActiveClickData);
router.delete('/url/:urlId', authMiddleware, deleteShortUrl);
router.put('/url/:urlId', authMiddleware, updateShortUrl);
router.get('/:shortId',  handleRedirect);






module.exports = router;
