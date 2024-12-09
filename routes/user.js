require('dotenv').config()

const express = require('express');
const {
    createUser,
    loginUser,
    getUsers,
    deleteUser,
    updateUser,
    addExamToStudent,
    getUser
} = require('../controlers/userController')

const router = express.Router();


router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);
router.patch('/exam/:id', addExamToStudent)

// Register a new user
router.post('/register', createUser);

// Log in an existing user
router.post('/login', loginUser);

module.exports = router;
