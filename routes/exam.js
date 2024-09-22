const express = require('express');
const router = express.Router();
const {
    createExam,
    getExams,
} = require('../controlers/examController')

// Exam routes
router.post('/', createExam);
router.get('/', getExams);

module.exports = router;
