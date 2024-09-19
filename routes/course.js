require('dotenv').config()

const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    deleteCourse,
    updateCourse,
    addTopicToSubject,
    deleteTopic,
    updateTopic,
    addQuestionToTopic,
    deleteQuestion,
    updateQuestion
} = require('../controlers/courseController')

const router = express.Router();

router.get('/', getCourses)

router.get('/:id', getCourse)

router.post('/', createCourse)

router.delete('/:id', deleteCourse)

router.patch('/:id', updateCourse)

router.patch('/:courseId/year/:year/subject/:subjectName/topics', addTopicToSubject);

router.delete('/:courseId/year/:year/subject/:subjectName/topics/:topicId', deleteTopic);

router.patch('/:courseId/year/:year/subject/:subjectName/topics/:topicId', updateTopic);

router.patch('/:courseId/year/:year/subject/:subjectName/topics/:topicName/questions', addQuestionToTopic);

router.delete('/:courseId/year/:year/subject/:subjectName/topics/:topicName/questions/:questionId', deleteQuestion);

router.patch('/:courseId/year/:year/subject/:subjectName/topics/:topicName/questions/:questionId', updateQuestion);



module.exports = router;
