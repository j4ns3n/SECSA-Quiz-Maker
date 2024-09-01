
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose')


//create new user
const createUser = async (req, res) => {
    const { username, password, firstName, middleName, lastName } = req.body

    const exist = await User.findOne({ username });
    if (exist) {
        res.status(400).json({ error: "Username already exist" })
    }
    //add doc to db
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, firstName, middleName, lastName })
    res.status(200).json(user)
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
            expiresIn: '1d', // Token expires in 1 hour
        });

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // If the login is successful, you can return the user data
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createUser,
    loginUser
}