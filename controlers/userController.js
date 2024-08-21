
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose')


//create new user
const createUser = async (req, res) => {
    const {username, password, firstName, middleName, lastName } = req.body

    //add doc to db
    try{
        const user = await User.create({username, password, firstName, middleName, lastName})
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        // Check if the password and user.password are valid strings
        if (!password || !user.password || !user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // If the login is successful, you can return the user data
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createUser,
    loginUser
}