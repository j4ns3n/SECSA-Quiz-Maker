const Exam = require('../models/exam');
const mongoose = require('mongoose')

// Create a new exam
const createExam = async (req, res) => {
    const { title, course, yearLevel, subject, topics } = req.body;

    try {
        let totalQuestions = 0;

        topics.forEach(topic => {
            totalQuestions += topic.selectedQuestions.easy.length;
            totalQuestions += topic.selectedQuestions.intermediate.length;
            totalQuestions += topic.selectedQuestions.difficult.length;
        });

        const newExam = new Exam({
            title,
            course,
            yearLevel,
            subject,
            topics,
            totalQuestions  
        });

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

const deleteExam = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedExam = await Exam.findByIdAndDelete({ _id: id });

        if (!deletedExam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};






module.exports = {
    createExam,
    getExams,
    deleteExam
}