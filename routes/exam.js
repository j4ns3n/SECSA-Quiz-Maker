const express = require('express');
const router = express.Router();
const {
    createExam,
    getExams,
    deleteExam,
    findExam,
    addParticipantsToExam
} = require('../controlers/examController')

// Exam routes
router.post('/', createExam);
router.get('/', getExams);
router.delete('/:id', deleteExam);
router.get('/:examCode', findExam);
router.patch('/:examId', addParticipantsToExam);

module.exports = router;
