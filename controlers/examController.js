const Exam = require('../models/exam');
const crypto = require('crypto-browserify');


// Create a new exam
const createExam = async (req, res) => {
    const { title, course, yearLevel, subjects, topics, timer, passingRate } = req.body;
    
    try {
        let totalQuestions = 0;
        const examCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        topics.forEach(topic => {
            totalQuestions += topic.selectedQuestions.easy.length;
            totalQuestions += topic.selectedQuestions.intermediate.length;
            totalQuestions += topic.selectedQuestions.difficult.length;
        });

        const newExam = new Exam({
            title,
            course,
            yearLevel,
            subjects,
            topics,
            totalQuestions,
            examCode,
            timer,
            passingRate
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

const findExam = async (req, res) => {
    const { examCode } = req.params;

    try {
        const exam = await Exam.findOne({ examCode: examCode });
        if (exam) {
            res.status(200).json(exam);
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const addParticipantsToExam = async (req, res) => {

    const { examId } = req.params;
    const { name, course, score, questions } = req.body;
    try {
        const exam = await Exam.findById(examId);

        if (!exam) {
            console.error("Exam not found");
            return;
        }

        const participantData = {
            name: name,
            course: course,
            score: score,
            questions: questions
        }

        exam.participants.push(participantData);

        await exam.save(participantData);

        res.status(200).json(exam)
    } catch (error) {
        console.error("Error adding participant:", error);
    }
};


module.exports = {
    createExam,
    getExams,
    deleteExam,
    findExam,
    addParticipantsToExam
}