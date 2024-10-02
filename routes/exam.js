const express = require('express');
const router = express.Router();
const {
    createExam,
    getExams,
    deleteExam
} = require('../controlers/examController')

// Exam routes
router.post('/', createExam);
router.get('/', getExams);
router.delete('/:id', deleteExam);

module.exports = router;
