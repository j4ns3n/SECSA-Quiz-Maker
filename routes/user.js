require('dotenv').config()

const express = require('express');
const {
    createUser,
    loginUser,
    getUsers,
    deleteUser
} = require('../controlers/userController')

const router = express.Router();


router.get('/', getUsers);
router.delete('/:id', deleteUser);

// Register a new user
router.post('/register', createUser);

// Log in an existing user
router.post('/login', loginUser);

module.exports = router;
