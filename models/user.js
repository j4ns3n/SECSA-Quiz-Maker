const mongoose = require('mongoose')

const Schema = mongoose.Schema

const examSchem = new Schema({
    examId: { type: String, required: true },
    examTitle: { type: String, required: true },
    course: { type: String, required: true },
    code: { type: String, required: true },
    score: { type: String, required: true },
    questions: [
      {
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
        question: { type: String, required: true },
        userAnswer: { type: String, required: true }
      }
    ]
}, { timestamps: true });

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    role: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    course: {
        type: String
    },
    yearLevel: {
        type: String
    },
    exams: [examSchem]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
