require('dotenv').config()

const express = require('express');
const {
    createUser,
    loginUser
} = require('../controlers/userController')

const router = express.Router();


// Register a new user
router.post('/register', createUser);

// Log in an existing user
router.post('/login', loginUser);

module.exports = router;
