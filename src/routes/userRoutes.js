const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const router = express.Router();



module.exports = router;