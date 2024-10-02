
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose')


//create new user
const createUser = async (req, res) => {
    const { username, password, firstName, middleName, lastName, role, department, email } = req.body

    const exist = await User.findOne({ username });
    if (exist) {
        res.status(400).json({ error: "Username already exist" })
    }
    //add doc to db
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, firstName, middleName, lastName, role, department, email })
    res.status(200).json(user)
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password') 
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete({ _id: id });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!password || !user.password || !user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d', 
        });

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createUser,
    loginUser,
    getUsers,
    deleteUser
}