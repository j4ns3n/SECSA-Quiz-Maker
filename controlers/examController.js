const Exam = require('../models/exam');
const mongoose = require('mongoose')

// Create a new exam
const createExam = async (req, res) => {
    const { title, course, yearLevel, subject, topics } = req.body;

    try {
        const newExam = new Exam({ title, course, yearLevel, subject, topics });
        await newExam.save();
        res.status(201).json(newExam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all exams
const getExams = async (req, res) => {
    const exam = await Exam.find({}).sort({ createAt: -1 })

    res.status(200).json(exam)
}



module.exports = {
    createExam,
    getExams
}