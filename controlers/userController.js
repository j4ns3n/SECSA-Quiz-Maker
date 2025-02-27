
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')


//create new user
const createUser = async (req, res) => {
    const { username, password, firstName, middleName, lastName, role, department, email, course, yearLevel } = req.body

    const exist = await User.findOne({ username });
    if (exist) {
        return res.status(400).json({ error: "Username already exists" });
    }

    //add doc to db
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, firstName, middleName, lastName, role, department, email, course, yearLevel })
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

const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: user });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
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


const updateUser = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Cant find User' });
    }

    const user = await User.findByIdAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true } // Add this option to return the updated user
    );

    if (!user) {
        return res.status(400).json({ error: "Cant find User" });
    }

    res.status(200).json(user);
};

const addExamToStudent = async (req, res) => {
    const { id } = req.params;
    const { examData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Cant find User' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "Cant find User" });
        }

        user.exams.push(examData);

        await user.save();

        return res.status(200).json({ message: 'Exam data added successfully', user });

    } catch (error) {
        console.error('Error saving user:', error);
        return res.status(500).json({ error: 'Failed to add exam data' });
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
        const role = user.role;
        const userData = {
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            course: user.course,
            yearLevel: user.yearLevel,
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '8h',
        });

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ role, token, userData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createUser,
    loginUser,
    getUsers,
    deleteUser,
    updateUser,
    addExamToStudent,
    getUser
}